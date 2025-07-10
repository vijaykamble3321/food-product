import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiShoppingCart, FiSearch, FiX, FiPlus, FiMinus, FiCheck, FiArrowLeft } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const FoodsCategory = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const categories = [
    'Pizzas', 'Burgers', 'Sandwiches', 'Salads', 
    'Juices', 'Smoothies', 'Ice-Creams'
  ];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [animatedProduct, setAnimatedProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyExists, setShowAlreadyExists] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/food-data.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        const transformedData = [];
        Object.keys(data).forEach((category) => {
          data[category].forEach((product) => {
            transformedData.push({
              ...product,
              category: category,
            });
          });
        });

        setProducts(transformedData);
        setFilteredProducts(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterByCategory = (category) => {
    setActiveCategory(category);
    applyFilters(category, searchQuery);
  };

  const applyFilters = (category, query) => {
    let filtered = products;
    
    if (category !== 'All') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) || 
        product.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(activeCategory, query);
  };

  const handleAddToOrder = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setShowAlreadyExists(true);
      setTimeout(() => setShowAlreadyExists(false), 2000);
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
      setAnimatedProduct(product);
      setShowCartAnimation(true);
      setTimeout(() => {
        setShowCartAnimation(false);
      }, 1000);
    }
    
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? subtotal * 0.1 : 0;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.05;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handlePlaceOrder = () => {
    setShowSuccessModal(true);
    setIsCartOpen(false);
    setTimeout(() => {
      setShowSuccessModal(false);
      setCartItems([]);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-blue-600 font-medium">Loading delicious menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Menu Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white relative overflow-x-hidden">
      {/* Already Exists Notification */}
      {showAlreadyExists && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow-lg z-50 animate-bounce">
          Item already in cart! Quantity increased.
        </div>
      )}

      {/* Cart Animation */}
      {showCartAnimation && animatedProduct && (
        <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-slideToCart">
            <div className="bg-white p-3 rounded-lg shadow-xl flex items-center">
              <img 
                src={animatedProduct.image || 'https://images.unsplash.com/photo-1601924582971-6c90f2f7d8a7?auto=format&fit=crop&w=300&h=200&q=80'}
                alt={animatedProduct.name}
                className="w-12 h-12 object-cover rounded-md mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1585238342028-4cb788d389ec?auto=format&fit=crop&w=300&h=200&q=80';
                }}
              />
              <div>
                <p className="font-medium text-gray-800">{animatedProduct.name}</p>
                <p className="text-sm text-green-600">Added to cart!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
          />
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full text-center animate-scaleIn">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="text-green-600 text-4xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed!</h2>
              <p className="text-gray-600 mb-6">
                Your order has been successfully placed. We're preparing your delicious food!
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 z-40 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            {/* Back button for mobile */}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="sm:hidden text-gray-500 hover:text-gray-700 mr-2"
            >
              <FiArrowLeft size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 flex-grow text-center sm:text-left">
              Your Order
            </h2>
            
            {/* Close button for desktop */}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="hidden sm:block text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <FiShoppingCart size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some delicious items to get started</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all sm:hidden"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b border-gray-100">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1601924582971-6c90f2f7d8a7?auto=format&fit=crop&w=300&h=200&q=80'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1585238342028-4cb788d389ec?auto=format&fit=crop&w=300&h=200&q=80';
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-blue-600 font-bold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-500 hover:text-blue-600 p-1"
                      >
                        <FiMinus size={18} />
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-500 hover:text-blue-600 p-1"
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700 p-1"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600 font-medium">-₹{calculateDiscount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales Tax (5%):</span>
                    <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold mb-6 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md"
                >
                  Place Order
                </button>
                
                {/* Back button for mobile when cart has items */}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full mt-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all sm:hidden"
                >
                  Back to Menu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Delicious Menu</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fresh ingredients, authentic recipes, and mouth-watering flavors
          </p>
        </div>

        {/* Search and Categories */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for dishes..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-blue-600"
              >
                <FiShoppingCart size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={() => filterByCategory('All')}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === 'All'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-md'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={`${product.category}-${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 bg-gray-100">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1601924582971-6c90f2f7d8a7?auto=format&fit=crop&w=300&h=200&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585238342028-4cb788d389ec?auto=format&fit=crop&w=300&h=200&q=80';
                    }}
                  />
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                    {product.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-800">{product.name}</h3>
                    <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                    {product.description || 'Delicious and freshly made with premium ingredients!'}
                  </p>
                  <button 
                    onClick={() => handleAddToOrder(product)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2" />
                    Add to Order
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="inline-block p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-xl font-medium text-gray-800 mb-2">No items found</h3>
                <p className="text-gray-600">Try a different search or category</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideToCart {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(100px, -100px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(200px, -200px) scale(0.5);
          }
        }
        .animate-slideToCart {
          animation: slideToCart 1s ease-in-out forwards;
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce {
          animation: bounce 1s;
        }
      `}</style>
    </div>
  );
};

export default FoodsCategory;