import React, { useState } from 'react';

export default function OrderFlowHelp() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#1a2236] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-semibold">How Order Flow Works</h3>
        <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Order Flow Overview</h4>
            <p className="mb-2">
              The order flow system manages how orders progress through different statuses and who gets notified at each step.
            </p>
            <p>
              Each status can have multiple forwarding destinations (Telegram users, groups, or channels) and specific roles that are authorized to change the status.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400 mb-2">Status Flow</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">🆕 Created</div>
                <div>Order created, needs operator confirmation</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">✅ Confirmed</div>
                <div>Order confirmed, sent to shop owner</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">📦 Packing</div>
                <div>Order is being packed by shop</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">📋 Packed</div>
                <div>Order packed, ready for courier pickup</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">🚚 Courier Picked</div>
                <div>Order picked up by courier</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">🎯 Delivered</div>
                <div>Order delivered to customer</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">💰 Paid</div>
                <div>Order paid and completed</div>
              </div>
              <div className="bg-[#232b42] p-2 rounded">
                <div className="font-semibold">❌ Rejected</div>
                <div>Order rejected</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Forwarding Destinations</h4>
            <ul className="space-y-1 ml-4">
              <li>• <strong>👤 User:</strong> Send notifications to specific Telegram users</li>
              <li>• <strong>👥 Group:</strong> Send notifications to Telegram groups</li>
              <li>• <strong>📢 Channel:</strong> Send notifications to Telegram channels</li>
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              You can use placeholders like <code className="bg-gray-700 px-1 rounded">{'{{shop.orders_chat_id}}'}</code> or <code className="bg-gray-700 px-1 rounded">{'{{courier.telegramId}}'}</code>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Authorized Roles</h4>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Admin:</strong> Can change any status</li>
              <li>• <strong>Operator:</strong> Can confirm orders</li>
              <li>• <strong>ShopOwner:</strong> Can manage packing stages</li>
              <li>• <strong>Courier:</strong> Can update delivery status</li>
              <li>• <strong>User:</strong> Can cancel orders</li>
            </ul>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-3 rounded border border-blue-700">
            <h4 className="font-semibold text-blue-300 mb-1">💡 Tips</h4>
            <ul className="text-xs space-y-1">
              <li>• Custom flows override the default flow for this shop</li>
              <li>• Each status can have multiple forwarding destinations</li>
              <li>• Notifications are sent automatically when status changes</li>
              <li>• You can reset to default flow anytime</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 