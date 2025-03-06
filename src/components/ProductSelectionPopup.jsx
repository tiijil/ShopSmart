import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Check, Loader2, Search, X } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog"

/**
 * @typedef {Object} ProductVariant
 * @property {number} id
 * @property {number} product_id
 * @property {string} title
 * @property {string} price
 * @property {boolean} [selected]
 */

/**
 * @typedef {Object} ProductImage
 * @property {number} id
 * @property {number} product_id
 * @property {string} src
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} title
 * @property {ProductVariant[]} variants
 * @property {ProductImage} image
 * @property {boolean} [selected]
 */

/**
 * @typedef {Object} ProductSelectionPopupProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {(selectedProducts: any) => void} onProductSelect
 * @property {number} [selectedProductId]
 * @property {string} apiKey
 */

/**
 * Product Selection Popup Component
 * @param {ProductSelectionPopupProps} props
 */
export function ProductSelectionPopup({
  isOpen,
  onClose,
  onProductSelect,
  selectedProductId,
  apiKey,
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const lastProductRef = useRef(null)
  const observerRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const fetchProducts = useCallback(
    async (searchTerm, pageNum, reset = false) => {
      try {
        setLoading(true)
        setError("")

        const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.example.com" // Fallback URL
        const apiKeyToUse = apiKey || import.meta.env.VITE_API_KEY // Use prop or env var
        
        console.log("API Config:", { 
          baseUrl: baseUrl ? "Set" : "Not set", 
          apiKey: apiKeyToUse ? "Set" : "Not set" 
        });
        
        if (!baseUrl || !apiKeyToUse) {
          throw new Error("API configuration is missing. Please check your environment variables.");
        }
        
        // Add retry logic for API fetch
        let retries = 3;
        let response;
        let fetchError;
        
        const url = `${baseUrl}/products/search?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=10`;
        console.log(`Fetching from: ${url}`);
        
        while (retries > 0) {
          try {
            response = await fetch(url, {
              headers: {
                "x-api-key": apiKeyToUse,
                "Accept": "application/json"
              },
              // Add cache control to prevent duplicate results
              cache: 'no-store'
            });
            
            console.log(`Fetch attempt response:`, { 
              status: response.status, 
              ok: response.ok,
              statusText: response.statusText
            });
            
            if (response.ok) break;
            
            // If we get a 429 (too many requests), wait longer
            if (response.status === 429) {
              await new Promise(r => setTimeout(r, 2000));
            } else {
              await new Promise(r => setTimeout(r, 1000));
            }
          } catch (error) {
            console.error("Fetch attempt failed:", error);
            fetchError = error;
          }
          
          retries--;
          console.log(`Retries left: ${retries}`);
        }

        if (!response) {
          throw new Error(`Network error: ${fetchError?.message || "Failed to connect to API"}`);
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("API endpoint not found. Please check the API URL.");
          } else if (response.status === 401 || response.status === 403) {
            throw new Error("API authentication failed. Please check your API key.");
          } else {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
        }

        // Read the response as text first for debugging
        const text = await response.text();
        console.log("Raw API response:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));
        
        // Handle empty response
        if (!text || text.trim() === "") {
          console.log("Empty response received from API");
          // Instead of throwing an error, return empty array
          setProducts(reset ? [] : prev => prev);
          setHasMore(false);
          return;
        }
        
        // Try to parse the response as JSON
        let data;
        try {
          data = JSON.parse(text);
          console.log("Parsed data type:", typeof data, Array.isArray(data) ? "array" : "not array");
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          throw new Error("Invalid JSON response from API");
        }
        
        // More robust data validation
        if (!data) {
          console.log("Null or undefined data after parsing");
          // Instead of throwing an error, return empty array
          setProducts(reset ? [] : prev => prev);
          setHasMore(false);
          return;
        }
        
        // Handle both array and object responses
        let productsArray;
        
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.products && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (typeof data === 'object') {
          // Try to extract an array from the response
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Use the first array found
            productsArray = possibleArrays[0];
          } else {
            console.log("No arrays found in response object:", Object.keys(data));
            // Create a mock product for testing if in development
            if (import.meta.env.DEV) {
              productsArray = [
                {
                  id: "mock-1",
                  title: "Mock Product",
                  variants: [
                    { id: "mock-v1", title: "Mock Variant", price: "9.99" }
                  ]
                }
              ];
              console.log("Created mock product for development");
            } else {
              // In production, just return empty array
              setProducts(reset ? [] : prev => prev);
              setHasMore(false);
              return;
            }
          }
        } else {
          console.log("Unexpected data type:", typeof data);
          // Instead of throwing an error, return empty array
          setProducts(reset ? [] : prev => prev);
          setHasMore(false);
          return;
        }
        
        console.log(`Found ${productsArray.length} products in response`);
        
        // Ensure each product has the required fields
        const formattedData = productsArray.map((product) => {
          // Ensure product has an id
          const id = product.id || `generated-${Math.random().toString(36).substring(2, 9)}`;
          // Ensure product has a title
          const title = product.title || "Unnamed Product";
          
          return {
            ...product,
            id,
            title,
            selected: false,
            variants: Array.isArray(product.variants) 
              ? product.variants.map((variant) => ({
                  ...variant,
                  // Ensure variant has an id
                  id: variant.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
                  // Ensure variant has a title
                  title: variant.title || "Unnamed Variant",
                  // Ensure variant has a price
                  price: variant.price || "0.00",
                  selected: false,
                }))
              : [{ id: `default-${id}`, title: "Default", price: "0.00", selected: false }], // Create default variant if none exists
          };
        });

        // If resetting, just set the new data
        // If appending, make sure we don't add duplicates by checking IDs
        if (reset) {
          setProducts(formattedData);
        } else {
          setProducts((prev) => {
            // Get all existing product IDs
            const existingIds = new Set(prev.map(p => p.id));
            
            // Only add products that don't already exist
            const newProducts = formattedData.filter(p => !existingIds.has(p.id));
            
            return [...prev, ...newProducts];
          });
        }

        setHasMore(productsArray.length > 0);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(`Failed to fetch products: ${error.message}`);
        // Don't clear products on error if we already have some
        if (reset) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Reset products and show loading state immediately when search changes
    if (searchQuery !== debouncedSearchQuery) {
      setLoading(true);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // This will trigger the useEffect that fetches products
    }, 300) // 300ms debounce delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, debouncedSearchQuery])

  // Initial fetch when dialog opens or search query changes
  useEffect(() => {
    if (isOpen) {
      setPage(0)
      setProducts([]) // Clear products when search changes
      fetchProducts(debouncedSearchQuery, 0, true)
    }
  }, [isOpen, fetchProducts, debouncedSearchQuery])

  // Setup intersection observer for infinite scrolling with optimized options
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '200px', // Load earlier before reaching the end
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        // Prevent multiple fetches at once
        setPage((prevPage) => prevPage + 1);
      }
    }, options);

    if (lastProductRef.current) {
      observerRef.current.observe(lastProductRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  // Fetch more products when page changes
  useEffect(() => {
    if (page > 0) {
      fetchProducts(debouncedSearchQuery, page);
    }
  }, [page, fetchProducts, debouncedSearchQuery]);

  // Handle search input changes - only update the input value, actual search is debounced
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Memoize the selected count calculation to avoid recalculating on every render
  const selectedCount = useMemo(() => {
    return products.reduce((count, product) => {
      if (product.selected) {
        return count + product.variants.filter((variant) => variant.selected).length
      }
      return count
    }, 0)
  }, [products])

  const toggleProductSelection = useCallback((productId) => {
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          const newSelected = !product.selected
          return {
            ...product,
            selected: newSelected,
            variants: product.variants.map((variant) => ({
              ...variant,
              selected: newSelected ? variant.selected : false,
            })),
          }
        }
        return product
      }),
    )
  }, [products])

  const toggleVariantSelection = useCallback((productId, variantId) => {
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.map((variant) => {
            if (variant.id === variantId) {
              return { ...variant, selected: !variant.selected }
            }
            return variant
          })

          // If any variant is selected, the product should be selected too
          const anyVariantSelected = updatedVariants.some((v) => v.selected)

          return {
            ...product,
            selected: anyVariantSelected,
            variants: updatedVariants,
          }
        }
        return product
      }),
    )
  }, [products])

  const handleAddProducts = useCallback(() => {
    const selectedProducts = products
      .filter((product) => product.selected)
      .map((product) => ({
        id: product.id,
        name: product.title,
        image: product.image?.src || "/placeholder.svg?height=40&width=40",
        variants: product.variants
          .filter((variant) => variant.selected)
          .map((variant) => ({
            id: variant.id.toString(),
            name: variant.title,
            size: variant.title.split(" / ")[0],
            color: variant.title.split(" / ")[1] || "",
            material: "",
            available: 99,
            price: Number.parseFloat(variant.price),
            selected: true,
          })),
      }))

    onProductSelect(selectedProducts)
    onClose()
  }, [products, onProductSelect, onClose])

  // Memoize the product list rendering to prevent unnecessary re-renders
  const productList = useMemo(() => {
    return products.map((product, index) => (
      <div
        key={product.id}
        className="mb-4"
        ref={index === products.length - 1 ? lastProductRef : null}
      >
        <div
          className="flex items-center py-3.5 px-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
          onClick={() => toggleProductSelection(product.id)}
        >
          <div
            className={`w-6 h-6 rounded-md border flex items-center justify-center mr-3 transition-colors ${product.selected ? "bg-[#00694A] border-[#00694A]" : "border-gray-300"}`}
          >
            {product.selected && <Check className="h-4 w-4 text-white" />}
          </div>
          <div className="flex items-center">
            {product.image?.src ? (
              <img
                src={product.image.src}
                alt={product.title}
                className="w-10 h-10 object-cover rounded-md mr-3"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <span className="font-medium text-black">{product.title}</span>
          </div>
        </div>

        <div className="ml-12 mb-2">
          {product.variants.map((variant, variantIndex) => (
            <div key={variant.id}>
              <div
                className={`py-3 px-3 flex items-center justify-between rounded-md transition-colors ${
                  product.selected ? "hover:bg-gray-50 cursor-pointer" : "opacity-70"
                }`}
                onClick={() => product.selected && toggleVariantSelection(product.id, variant.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 transition-colors ${
                      variant.selected ? "bg-[#00694A] border-[#00694A]" : "border-gray-300"
                    }`}
                  >
                    {variant.selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`font-medium ${product.selected ? "text-black" : "text-gray-800"}`}>
                    {variant.title}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`font-medium ${product.selected ? "text-gray-900" : "text-gray-800"}`}>
                    99 available
                  </span>
                  <span className={`font-medium ${product.selected ? "text-black" : "text-gray-900"}`}>
                    ${variant.price}
                  </span>
                </div>
              </div>
              {variantIndex < product.variants.length - 1 && (
                <div className="h-px bg-gray-200 w-full my-1 ml-8"></div>
              )}
            </div>
          ))}
        </div>
        
        {index < products.length - 1 && (
          <div className="h-px bg-gray-200 w-full my-2"></div>
        )}
      </div>
    ))
  }, [products, toggleProductSelection, toggleVariantSelection, lastProductRef])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">Select Products</DialogTitle>
            <button 
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <DialogDescription className="px-4 pt-2 text-sm text-gray-500">
            
          </DialogDescription>

          <div className="p-4 sticky top-0 bg-white border-b z-10 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00694A] focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#CBD5E1 transparent'
          }}>
            {error && (
              <div className="text-red-600 p-4 text-center font-medium bg-red-50 rounded-md my-4 border border-red-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => fetchProducts(debouncedSearchQuery, 0, true)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {loading && products.length === 0 && !error && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#00694A]" />
              </div>
            )}

            {!loading && products.length === 0 && !error && (
              <div className="text-gray-500 p-4 text-center">No products found</div>
            )}

            {productList}

            {loading && products.length > 0 && (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#00694A]" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700">
              {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                className={`bg-[#00694A] hover:bg-[#00694A]/90 text-white px-8 py-2.5 rounded-md transition-colors ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAddProducts}
                disabled={selectedCount === 0}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 