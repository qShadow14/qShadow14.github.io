-- RedLife E-Commerce Delivery System
-- This script runs on the FiveM server and processes pending item deliveries from the website

local deliveryCheckInterval = 60000 -- Check every 60 seconds

-- Function to get pending deliveries
local function getPendingDeliveries()
    local result = MySQL.Sync.fetchAll('SELECT * FROM delivery_queue WHERE status = "pending" LIMIT 50')
    return result
end

-- Function to deliver items to player
local function deliverItemsToPlayer(userId, itemsData)
    if not itemsData or not userId then return false end
    
    print("^2[DELIVERY]^7 Processing delivery for user " .. userId)
    
    for _, item in ipairs(itemsData) do
        if item.type == 'car' then
            -- Add vehicle to garage
            MySQL.Async.execute('INSERT INTO user_vehicles (user_id, vehicle, plate) VALUES (?, ?, ?)', 
                {userId, item.vehicle, item.plate or generatePlate()},
                function(rowsChanged)
                    print("^3[DELIVERY]^7 Car added: " .. item.vehicle .. " for user " .. userId)
                end
            )
        elseif item.type == 'money' then
            -- Add money to player
            MySQL.Async.fetchAll('SELECT money FROM vrp_user_data WHERE user_id = ?', {userId}, 
                function(result)
                    local currentMoney = result[1] and result[1].money or 0
                    MySQL.Async.execute('UPDATE vrp_user_data SET money = ? WHERE user_id = ?', 
                        {currentMoney + item.amount, userId})
                    print("^3[DELIVERY]^7 Money added: $" .. item.amount .. " for user " .. userId)
                end
            )
        elseif item.type == 'item' then
            -- Add item (custom implementation based on your inventory system)
            -- This is an example for vRP inventory
            TriggerEvent('vrp_inventory:giveItem', userId, item.itemName, item.quantity or 1)
            print("^3[DELIVERY]^7 Item added: " .. item.itemName .. " for user " .. userId)
        elseif item.type == 'faction' then
            -- Set faction
            MySQL.Async.execute('UPDATE vrp_users SET faction = ? WHERE id = ?', 
                {item.faction, userId},
                function(rowsChanged)
                    print("^3[DELIVERY]^7 Faction set to: " .. item.faction .. " for user " .. userId)
                end
            )
        end
    end
    
    return true
end

-- Function to mark delivery as processed
local function markDeliveryProcessed(deliveryId)
    MySQL.Async.execute('UPDATE delivery_queue SET status = ?, processed_at = NOW() WHERE id = ?', 
        {'completed', deliveryId},
        function(rowsChanged)
            if rowsChanged > 0 then
                print("^2[DELIVERY]^7 Marked delivery " .. deliveryId .. " as completed")
            end
        end
    )
end

-- Generate random license plate
function generatePlate()
    local chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    local plate = ''
    for i = 1, 8 do
        plate = plate .. string.sub(chars, math.random(1, #chars), math.random(1, #chars))
    end
    return plate
end

-- Main delivery processing loop
local function processDeliveries()
    getPendingDeliveries(function(deliveries)
        if not deliveries or #deliveries == 0 then
            return
        end
        
        for _, delivery in ipairs(deliveries) do
            local items = json.decode(delivery.data)
            
            if items and #items > 0 then
                -- Deliver items
                if deliverItemsToPlayer(delivery.user_id, items) then
                    -- Mark as processed
                    markDeliveryProcessed(delivery.id)
                    
                    -- Notify player if online (optional)
                    local xPlayer = ESX.GetPlayerFromId(delivery.user_id)
                    if xPlayer then
                        TriggerClientEvent('chat:addMessage', xPlayer.source, {
                            args = {'SHOP', 'Your purchase has been delivered! Check your inventory.'},
                            color = {0, 200, 255}
                        })
                    end
                end
            else
                -- Invalid data, mark as failed
                MySQL.Async.execute('UPDATE delivery_queue SET status = ? WHERE id = ?', 
                    {'failed', delivery.id})
            end
        end
    end)
end

-- Alternative version with MySQL.Sync if using MySQL wrapper
local function processDeliveriesSync()
    local deliveries = MySQL.Sync.fetchAll('SELECT * FROM delivery_queue WHERE status = "pending" LIMIT 50')
    
    if not deliveries or #deliveries == 0 then
        return
    end
    
    for _, delivery in ipairs(deliveries) do
        local items = json.decode(delivery.data)
        
        if items and #items > 0 then
            deliverItemsToPlayer(delivery.user_id, items)
            markDeliveryProcessed(delivery.id)
            
            print("^2[DELIVERY]^7 Processed delivery #" .. delivery.id .. " for user " .. delivery.user_id)
        end
    end
end

-- Start the delivery check loop
Citizen.CreateThread(function()
    while true do
        Wait(deliveryCheckInterval)
        
        -- Process pending deliveries
        processDeliveriesSync()
    end
end)

-- Command to manually process deliveries (admin only)
TriggerEvent('chat:addSuggestion', '/procesdeliveries', 'Process pending website purchases (Admin)')

RegisterCommand('processdeliveries', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if xPlayer.getGroup() ~= 'admin' then
        TriggerClientEvent('chat:addMessage', source, {
            args = {'SYSTEM', 'You do not have permission to use this command.'},
            color = {255, 0, 0}
        })
        return
    end
    
    processDeliveriesSync()
    
    TriggerClientEvent('chat:addMessage', source, {
        args = {'SYSTEM', 'Processed pending deliveries.'},
        color = {0, 255, 0}
    })
end)

-- Log startup
print("^2[DELIVERY]^7 E-Commerce delivery system started!")
print("^2[DELIVERY]^7 Checking for pending deliveries every " .. (deliveryCheckInterval / 1000) .. " seconds")
