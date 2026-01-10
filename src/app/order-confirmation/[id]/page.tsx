'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseHelpers } from '@/lib/supabase';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  product_name?: string;
}

interface OrderDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  zip_code: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error: orderError } = await supabaseHelpers.getOrderById(orderId);
        if (orderError) throw orderError;
        setOrder(data);

        const { data: itemsData, error: itemsError } = await supabaseHelpers.getOrderItems(orderId);
        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!order || error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-gray-500 mb-4">{error || 'Order not found'}</p>
        <Link href="/orders" className="text-indigo-600 hover:text-indigo-500">
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusColor = {
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    processing: 'bg-blue-50 border-blue-200 text-blue-800',
    shipped: 'bg-purple-50 border-purple-200 text-purple-800',
    delivered: 'bg-green-50 border-green-200 text-green-800',
  }[order.status] || 'bg-gray-50 border-gray-200 text-gray-800';

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Order Confirmation</h1>
            <p className="text-gray-600 mt-2">Order ID: {order.id}</p>
          </div>

          {/* Status */}
          <div className={`border rounded-lg p-4 mb-8 ${statusColor}`}>
            <p className="text-sm font-medium">
              <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
            <p className="text-sm mt-1">
              Order placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="border rounded-lg divide-y">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Product ID: {item.product_id}</p>
                      {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600">
                  {order.city}, {order.zip_code}
                </p>
                <p className="text-sm text-gray-600 mt-2">{order.customer_email}</p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>
            </div>

            {/* Order Totals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Method</h3>
            <p className="text-sm text-blue-800">Cash on Delivery</p>
            <p className="text-sm text-blue-800 mt-2">
              Please pay the amount upon delivery of your order.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/orders"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-900 font-medium hover:bg-gray-50"
            >
              Back to Orders
            </Link>
            <Link
              href="/shop"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
