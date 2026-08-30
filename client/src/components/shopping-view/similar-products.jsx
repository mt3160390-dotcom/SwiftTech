import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSimilarProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * SimilarProducts
 *
 * Renders a "You May Also Like" section driven by the hybrid recommendation
 * algorithm (content-based + collaborative filtering).
 *
 * Props:
 *  - productId  : _id of the currently viewed product (seed for the algorithm)
 *  - limit      : max number of recommendations to show (default 5)
 *  - onProductClick : callback(productId) so clicking a card opens its detail dialog
 */
function SimilarProducts({ productId, limit = 5, onProductClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { similarProducts } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  // Fetch recommendations whenever the seed product changes
  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts({ productId, limit }));
    }
  }, [productId, limit, dispatch]);

  function handleAddToCart(e, product) {
    // Stop the click from bubbling up to the card (which opens the detail dialog)
    e.stopPropagation();

    if (!user) {
      toast({ title: "Please sign up or login to add items to cart" });
      navigate("/auth/register");
      return;
    }

    const cartItemList = cartItems?.items || [];
    const existingItem = cartItemList.find((i) => i.productId === product._id);

    if (existingItem && existingItem.quantity + 1 > product.totalStock) {
      toast({
        title: `Only ${existingItem.quantity} quantity can be added for this item`,
        variant: "destructive",
      });
      return;
    }

    dispatch(addToCart({ userId: user.id, productId: product._id, quantity: 1 })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user.id));
          toast({ title: "Product added to cart" });
        }
      }
    );
  }

  function handleCardClick(id) {
    if (onProductClick) onProductClick(id);
  }

  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-6 rounded bg-primary" />
        <h3 className="text-lg font-bold">You May Also Like</h3>
        <span className="text-xs text-muted-foreground ml-1">
          — Hybrid recommendation
        </span>
      </div>

      {/* Horizontally scrollable card row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {similarProducts.map((product) => {
          const displayPrice =
            product.salePrice > 0 ? product.salePrice : product.price;
          const hasSale = product.salePrice > 0;

          return (
            <Card
              key={product._id}
              onClick={() => handleCardClick(product._id)}
              className="min-w-[160px] max-w-[160px] cursor-pointer hover:shadow-md transition-shadow flex-shrink-0"
            >
              {/* Product image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-[120px] object-cover rounded-t-lg"
                />
                {hasSale && (
                  <Badge className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 py-0">
                    Sale
                  </Badge>
                )}
                {product.totalStock === 0 && (
                  <Badge className="absolute top-1 right-1 bg-gray-500 text-white text-[10px] px-1 py-0">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <CardContent className="p-2">
                {/* Title */}
                <h4 className="text-xs font-semibold line-clamp-2 leading-tight mb-1">
                  {product.title}
                </h4>

                {/* Price */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className={`text-sm font-bold ${hasSale ? "line-through text-muted-foreground text-xs" : "text-primary"}`}
                  >
                    Rs {product.price}
                  </span>
                  {hasSale && (
                    <span className="text-sm font-bold text-primary">
                      Rs {product.salePrice}
                    </span>
                  )}
                </div>

                {/* Star rating */}
                {product.averageReview > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(product.averageReview)
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-0.5">
                      ({product.averageReview.toFixed(1)})
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-2 pt-0">
                {product.totalStock === 0 ? (
                  <Button
                    size="sm"
                    className="w-full text-xs opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SimilarProducts;
