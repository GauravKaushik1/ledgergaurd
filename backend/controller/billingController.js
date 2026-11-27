exports.processCharge = async (req, res) => {
  const { accountId, amount, type, description } = req.body;
  const conn = req.dbConnection;
  const Account = conn.model('Account');
  const Ledger = conn.model('Ledger');

  const session = await conn.startSession();
  session.startTransaction();

  try {
    // 1. Secondary DB-level idempotency check inside isolated tenant DB
    const existingEntry = await Ledger.findOne({ idempotencyKey: req.idempotencyKey }).session(session);
    if (existingEntry) {
      await session.abortTransaction();
      return res.status(200).json({ message: 'Already processed', entry: existingEntry });
    }

    // 2. Fetch & validate account balance
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error('Account not found in tenant cluster');

    const delta = type === 'DEBIT' ? -Math.abs(amount) : Math.abs(amount);
    if (account.balance + delta < 0) {
      throw new Error('Insufficient funds for debit transaction');
    }

    // 3. Mutate Account & Append Immutable Ledger Entry atomically
    account.balance += delta;
    await account.save({ session });

    const [ledgerEntry] = await Ledger.create([{
      idempotencyKey: req.idempotencyKey,
      accountId,
      type,
      amount: Math.abs(amount),
      metadata: { description }
    }], { session });

    // 4. Commit ACID transaction
    await session.commitTransaction();

    const responsePayload = {
      status: 'SUCCESS',
      newBalance: account.balance,
      transaction: ledgerEntry
    };

    // Cache successful response in Redis for 24h to serve safe retries
    await req.redis.set(`res:${req.redisLockKey}`, JSON.stringify(responsePayload), 'EX', 86400);

    return res.status(201).json(responsePayload);

  } catch (error) {
    // Instant rollback on network drop, timeout, or constraint failure
    await session.abortTransaction();
    await req.redis.del(req.redisLockKey); // Release lock so client can retry failed attempt
    return res.status(400).json({ status: 'ROLLED_BACK', error: error.message });
  } finally {
    session.endSession();
  }
};

exports.getLedgerAnalytics = async (req, res) => {
  const Ledger = req.dbConnection.model('Ledger');
  const entries = await Ledger.find().sort({ createdAt: -1 }).limit(50);
  res.json({ tenant: req.tenantId, entries });
};
