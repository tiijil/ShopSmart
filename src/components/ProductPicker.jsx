import { useState, useRef } from "react"
import { Pencil, GripVertical, ChevronDown, X, AlertCircle, ChevronUp, ArrowRightLeft } from "lucide-react"
import { Button } from "./ui/button"
import { ProductSelectionPopup } from "./ProductSelectionPopup"
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @typedef {Object} ProductVariant
 * @property {string} id
 * @property {string} size
 * @property {string} color
 * @property {string} material
 * @property {string} name
 * @property {number} price
 * @property {Object} [discount]
 * @property {string} discount.value
 * @property {string} discount.type
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} image
 * @property {ProductVariant[]} [variants]
 * @property {boolean} [showVariants]
 * @property {Object} [discount]
 * @property {string} discount.value
 * @property {string} discount.type
 */

export default function ProductPicker() {
  // API key from environment variables
  const API_KEY = import.meta.env.VITE_API_KEY

  const [products, setProducts] = useState([
    { id: 1, name: "Select Product", image: "/placeholder.svg?height=40&width=40" },
  ])
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [error, setError] = useState("")

  const dragItem = useRef(null)
  const dragOverItem = useRef(null)
  const dragVariantItem = useRef(null)
  const dragOverVariantItem = useRef(null)

  const handleDragStart = (position) => {
    dragItem.current = position
    setTimeout(() => {
      const elements = document.querySelectorAll(".product-row")
      if (elements[position]) {
        elements[position].classList.add("opacity-50", "bg-gray-100")
      }
    }, 0)
  }

  const handleDragEnter = (position) => {
    dragOverItem.current = position
  }

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newProducts = [...products]
      const draggedItemContent = newProducts[dragItem.current]
      newProducts.splice(dragItem.current, 1)
      newProducts.splice(dragOverItem.current, 0, draggedItemContent)
      dragItem.current = null
      dragOverItem.current = null
      setProducts(newProducts)
    }
    document.querySelectorAll(".product-row").forEach((row) => {
      row.classList.remove("opacity-50", "bg-gray-100")
    })
  }

  const handleVariantDragStart = (productId, variantIndex) => {
    dragVariantItem.current = { productId, variantIndex }
    setTimeout(() => {
      const elements = document.querySelectorAll(`.variant-row-${productId}-${variantIndex}`)
      if (elements[0]) {
        elements[0].classList.add("opacity-50", "bg-gray-100")
      }
    }, 0)
  }

  const handleVariantDragEnter = (productId, variantIndex) => {
    dragOverVariantItem.current = { productId, variantIndex }
  }

  const handleVariantDragEnd = () => {
    if (dragVariantItem.current !== null && dragOverVariantItem.current !== null) {
      // Only reorder if within the same product
      if (dragVariantItem.current.productId === dragOverVariantItem.current.productId) {
        const productId = dragVariantItem.current.productId
        const productIndex = products.findIndex((p) => p.id === productId)

        if (productIndex !== -1 && products[productIndex].variants) {
          const newProducts = [...products]
          const variants = [...(newProducts[productIndex].variants || [])]
          const draggedVariant = variants[dragVariantItem.current.variantIndex]

          variants.splice(dragVariantItem.current.variantIndex, 1)
          variants.splice(dragOverVariantItem.current.variantIndex, 0, draggedVariant)

          newProducts[productIndex].variants = variants
          setProducts(newProducts)
        }
      }

      dragVariantItem.current = null
      dragOverVariantItem.current = null
    }

    document.querySelectorAll(".variant-row").forEach((row) => {
      row.classList.remove("opacity-50", "bg-gray-100")
    })
  }

  const addProduct = () => {
    const newId = uuidv4()
    setProducts([...products, { 
      id: newId, 
      name: "Select Product", 
      image: "/placeholder.svg?height=40&width=40",
      showVariants: false,
      variants: []
    }])
  }

  const removeProduct = (productId) => {
    if (products.length > 1) {
      setProducts(products.filter((product) => product.id !== productId))
    }
  }

  const toggleVariants = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, showVariants: !product.showVariants } : product,
      )
    )
  }

  const updateDiscount = (productId, value, type) => {
    // Ensure value is not negative and handle empty values better
    let sanitizedValue = value;
    if (value && value.startsWith('-')) {
      sanitizedValue = value.substring(1);
    }
    
    setProducts(
      products.map((product) => (product.id === productId ? { ...product, discount: { value: sanitizedValue, type } } : product)),
    )
  }

  const updateVariantDiscount = (productId, variantId, value, type) => {
    // Ensure value is not negative and handle empty values better
    let sanitizedValue = value;
    if (value && value.startsWith('-')) {
      sanitizedValue = value.substring(1);
    }
    
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants?.map((variant) =>
                variant.id === variantId 
                  ? { 
                      ...variant, 
                      discount: sanitizedValue || type ? { value: sanitizedValue || "", type } : undefined 
                    } 
                  : variant
              ),
            }
          : product,
      ),
    )
  }

  const removeDiscount = (productId) => {
    setProducts(products.map((product) => (product.id === productId ? { ...product, discount: undefined } : product)))
  }

  const removeVariantDiscount = (productId, variantId) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants?.map((variant) =>
                variant.id === variantId ? { ...variant, discount: undefined } : variant,
              ),
            }
          : product,
      ),
    )
  }

  const handleProductSelect = (selectedProducts) => {
    if (editingProductId) {
      // If multiple products are selected while editing
      if (selectedProducts.length > 1) {
        // Find the index of the product being edited
        const editingIndex = products.findIndex(p => p.id === editingProductId);
        
        if (editingIndex !== -1) {
          // Create a copy of the products array
          const newProducts = [...products];
          
          // First selected product replaces the one being edited
          const firstProduct = selectedProducts[0];
          newProducts[editingIndex] = {
            ...firstProduct,
            id: editingProductId,
            discount: products[editingIndex].discount,
            showVariants: products[editingIndex].showVariants || false
          };
          
          // Create new products for the additional selections
          const additionalProducts = selectedProducts.slice(1).map(product => ({
            ...product,
            id: uuidv4(),
            showVariants: false,
            discount: undefined
          }));
          
          // Insert additional products right after the edited product
          newProducts.splice(editingIndex + 1, 0, ...additionalProducts);
          
          setProducts(newProducts);
        }
      } else if (selectedProducts.length === 1) {
        // Update just the one product (original behavior)
        const newProducts = products.map((product) => {
          if (product.id === editingProductId) {
            const selectedProduct = selectedProducts[0];
            return { 
              ...selectedProduct, 
              id: product.id,
              discount: product.discount,
              showVariants: product.showVariants || false
            };
          }
          return product;
        });
        setProducts(newProducts);
      }
    } else if (selectedProducts.length > 0) {
      // Add all selected products
      const newProductsToAdd = selectedProducts.map(product => ({
        ...product,
        id: uuidv4(),
        showVariants: false,
        discount: undefined
      }));
      
      // Remove the initial placeholder product if it's the only one and has the default name
      if (products.length === 1 && products[0].name === "Select Product") {
        setProducts(newProductsToAdd);
      } else {
        setProducts([...products, ...newProductsToAdd]);
      }
    }
    setIsProductPopupOpen(false);
    setEditingProductId(null);
  };

  const DiscountInput = ({ value, type, onChange, onRemove, isVariant = false }) => (
    <div className="flex items-center gap-4">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value, type)}
        min="0"
        className={`w-20 px-3 py-2.5 h-10 ${isVariant ? 'rounded-full' : 'rounded-none'} text-sm text-black border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md appearance-none`}
        placeholder="0"
      />
      <button
        onClick={() => onChange(value, type === "% Off" ? "Fixed" : "% Off")}
        className={`w-[90px] px-3 py-2.5 h-10 ${isVariant ? 'rounded-full' : 'rounded-none'} text-sm text-black border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md flex items-center justify-between`}
      >
        <span>{type}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      <button
        onClick={onRemove}
        className={`h-10 w-10 flex items-center justify-center ${isVariant ? 'rounded-full' : 'rounded-none'} transition-colors -ml-4`}
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  )

  return (
    <div className="flex justify-center items-start mt-[-20px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6"
        style={{ boxShadow: '0 4px 10px rgba(2, 1, 18, 0.15)' }}
      >
        <div className="space-y-4 mx-auto w-[95%]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium pl-14">Add Products</h2>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="font-medium pl-14">Product</div>
            <div className="font-medium">Discount</div>
          </div>

          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div 
                key={product.id} 
                className="mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className="grid grid-cols-2 gap-4 items-center product-row py-2"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-400 flex items-center w-10 justify-end cursor-grab active:cursor-grabbing h-[42px]"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4 mr-1 hover:text-gray-600" />
                      {index + 1}.
                    </motion.span>
                    <div className="flex-1 relative">
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={product.name}
                          readOnly
                          placeholder="Select Product"
                          className="w-full bg-white px-4 py-2.5 pr-10 rounded-md border 
                          border-gray-200 text-sm text-black shadow-md cursor-default focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1 rounded-full transition-colors"
                          onClick={() => {
                            setEditingProductId(product.id)
                            setIsProductPopupOpen(true)
                          }}
                        >
                          <Pencil className="w-6 h-6 text-gray-400" />
                        </motion.button>

                        {products.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors ml-1"
                            onClick={() => removeProduct(product.id)}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {product.discount ? (
                      <DiscountInput
                        value={product.discount.value}
                        type={product.discount.type}
                        onChange={(value, type) => updateDiscount(product.id, value, type)}
                        onRemove={() => removeDiscount(product.id)}
                        isVariant={false}
                      />
                    ) : (
                      <div>
                        <Button
                          onClick={() => updateDiscount(product.id, "", "% Off")}
                          className="inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 text-sm h-11 bg-[#00694A] text-white hover:bg-[#00694A]/90 rounded-none w-[180px]"
                        >
                          Add Discount
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {product.variants && product.variants.length > 1 && (
                  <div className="pl-14 mt-3 flex justify-end pr-[180px]">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleVariants(product.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mr-5"
                    >
                      {product.showVariants ? (
                        <>
                          <span className="underline">Hide variants</span>
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <span className="underline">Show variants</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                <AnimatePresence>
                  {(product.variants && product.variants.length > 1 && product.showVariants) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2"
                    >
                      <div className="space-y-2">
                        {product.variants.map((variant, variantIndex) => (
                          <motion.div
                            key={variant.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: variantIndex * 0.05 }}
                            className={`grid grid-cols-2 gap-4 items-center variant-row variant-row-${product.id}-${variantIndex}`}
                            draggable
                            onDragStart={() => handleVariantDragStart(product.id, variantIndex)}
                            onDragEnter={() => handleVariantDragEnter(product.id, variantIndex)}
                            onDragEnd={handleVariantDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center gap-2 pl-14">
                              <motion.span 
                                whileHover={{ scale: 1.1 }}
                                className="text-gray-400 cursor-grab active:cursor-grabbing" 
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-4 w-4 hover:text-gray-600" />
                              </motion.span>
                              <div className="bg-white px-4 py-2 rounded-full text-sm text-black border border-gray-200 flex-1 truncate shadow-md font-medium">
                                {variant.name || `${variant.size} / ${variant.color} / ${variant.material}`}
                              </div>
                            </div>

                            <div>
                              <DiscountInput
                                value={variant.discount?.value || ""}
                                type={variant.discount?.type || "% Off"}
                                onChange={(value, type) => updateVariantDiscount(product.id, variant.id, value, type)}
                                onRemove={() => removeVariantDiscount(product.id, variant.id)}
                                isVariant={true}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add divider line between products, but not after the last one */}
                {index < products.length - 1 && (
                  <div className="grid grid-cols-2 gap-4 items-center py-2 mt-2">
                    <div className="h-px bg-gray-200 w-full ml-14"></div>
                    <div className="h-px bg-gray-200 w-[180px]"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="pt-4 flex justify-center">
            <div>
              <Button
                onClick={addProduct}
                className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground border-[#00694A] text-[#00694A] hover:bg-[#00694A]/10 px-12 py-2.5 h-auto text-sm font-medium rounded-md w-[220px] ml-[162px]"
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      {isProductPopupOpen && (
        <ProductSelectionPopup
          isOpen={isProductPopupOpen}
          onClose={() => setIsProductPopupOpen(false)}
          onProductSelect={handleProductSelect}
          selectedProductId={editingProductId}
          apiKey={API_KEY}
        />
      )}
    </div>
  )
} 