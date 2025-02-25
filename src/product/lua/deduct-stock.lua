local productKey = KEYS[1]
local productField = ARGV[1]
local quantity = tonumber(ARGV[2])
local currentValue = redis.call('HGET', productKey, productField)
local stock = tonumber(currentValue)
if stock == nil then
    return nil
end
if stock >= quantity then
    local newStock = stock - quantity
    redis.call('HSET', productKey, productField, tostring(newStock))
    return newStock
else
    return nil
end
