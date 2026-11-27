const Redis = require('ioredis');
const redis = new Redis();


const acquireLock = async (lockKey,  lockValue, ttl)=>{
    const result = await redis.set(lockKey,lockValue,"NX","PX",ttl);
    return result === "OK";
}

const releaseLock = async (lockKey,lockValue)=>{
    const script = `
    if redis.call("GET",KEYS[1]) == ARGV[1] then
        return redis.call("DEL",KEYS[1])
    else
        return 0
    end
    `
    return await redis.eval(script,1,lockKey,lockValue)
}

const performanceCriticalTask = async() =>{
    const lockKey="myresource-lock"
    const lockValue =(new Date()).toISOString()
    const ttl = 5000
    if(await acquireLock(lockKey,lockValue, ttl)){
        console.log("Lock acquired! Performing critical task...");

        try{
            await new Promise((resolve)=>setTimeout(resolve,3000))
        }finally{
            await releaseLock(lockKey,lockValue)
            console.log("Lock released")

        }
    }else{
        console.log("could not acquire lock some other process already acquire the lock")
    }
}