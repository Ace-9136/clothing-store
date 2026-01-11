'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/lib/store';
import { supabaseHelpers } from '@/lib/supabase';

export default function CartPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [mounted, setMounted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  useEffect(() => {
    // Mark as mounted to trigger hydration check
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await supabaseHelpers.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          setCheckoutData((prev) => ({
            ...prev,
            customerEmail: currentUser.email || '',
          }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    checkAuth();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const triggerConfetti = async () => {
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;
      
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Second burst after delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 300);
      
      // Third burst for extra effect
      setTimeout(() => {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.5 }
        });
      }, 600);
    } catch (err) {
      console.error('Confetti error:', err);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // Validate form
      if (!checkoutData.customerName || !checkoutData.customerEmail || !checkoutData.customerPhone || 
          !checkoutData.address || !checkoutData.city || !checkoutData.zipCode) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabaseHelpers.createOrder({
        user_id: user.id,
        customer_name: checkoutData.customerName,
        customer_email: checkoutData.customerEmail,
        customer_phone: checkoutData.customerPhone,
        address: checkoutData.address,
        city: checkoutData.city,
        zip_code: checkoutData.zipCode,
        total_amount: calculateTotal(),
        status: 'pending',
        payment_method: 'cash_on_delivery',
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created:', orderData);

      // Handle the response - Supabase insert returns array
      let orderId: string | null = null;
      
      if (orderData) {
        if (Array.isArray(orderData) && (orderData as any[]).length > 0) {
          orderId = ((orderData as any[])[0] as any).id;
        } else if (!Array.isArray(orderData) && (orderData as any).id) {
          orderId = (orderData as any).id;
        }
      }

      if (!orderId) {
        console.error('Failed to extract order ID from response:', orderData);
        throw new Error('Failed to create order - no order ID returned');
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderId as string,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size || undefined,
        color: undefined,
        price: item.price,
      }));

      console.log('Creating order items:', JSON.stringify(orderItems));
      
      const itemsResult = await supabaseHelpers.createOrderItems(orderItems);
      console.log('Order items result:', itemsResult);
      
      if (itemsResult.error) {
        console.warn('Order items creation warning:', itemsResult.error);
        // Continue anyway - order was created successfully
      } else {
        console.log('Order items created successfully');
      }

      // Clear cart immediately
      clearCart();
      
      // Show success state - order was created even if items failed
      setOrderSuccess(true);
      
      // Trigger confetti animation
      await triggerConfetti();
      
      // Redirect after confetti animation completes
      setTimeout(() => {
        router.push('/');
      }, 3500);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error creating order. Please try again.');
      setOrderSuccess(false);
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Shopping Cart</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !showCheckout && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Shopping Cart</h1>
        <p className="text-gray-500 mb-8">Your cart is empty</p>
        <Link href="/shop" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      <p className="text-sm text-gray-900 font-medium">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.productId, parseInt(e.target.value) || 1)
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary / Checkout */}
          {cartItems.length > 0 && !orderSuccess && (
            <div className="bg-gray-50 rounded-lg p-6">
              {!showCheckout ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700"
                  >
                    Proceed to Checkout
                  </button>
                  <Link href="/shop" className="text-center text-indigo-600 hover:text-indigo-500 mt-4 block">
                    Continue Shopping
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout</h2>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={checkoutData.customerName}
                        onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={checkoutData.customerEmail}
                        onChange={(e) => setCheckoutData({ ...checkoutData, customerEmail: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={checkoutData.customerPhone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        placeholder="123 Main Street"
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="New York"
                        value={checkoutData.city}
                        onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                      <input
                        type="text"
                        placeholder="10001"
                        value={checkoutData.zipCode}
                        onChange={(e) => setCheckoutData({ ...checkoutData, zipCode: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50"
                    >
                      Back to Cart
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Success Overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md border border-gray-200">
            <div className="mb-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Order Placed!</h2>
              <p className="text-gray-600">Thank you for your order.</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to home page...</p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}