const Product = require("../../models/Product");
const Order = require("../../models/Order");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;

        break;
      case "price-hightolow":
        sort.price = -1;

        break;
      case "title-atoz":
        sort.title = 1;

        break;

      case "title-ztoa":
        sort.title = -1;

        break;

      case "rating-hightolow":
        sort.averageReview = -1;

        break;

      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

/**
 * Hybrid Recommendation Algorithm
 *
 * Combines two signals for each candidate product:
 *
 * 1. Content-based score (max 10 pts)
 *    - Same category as the seed product  → +5 pts
 *    - Same brand as the seed product     → +3 pts
 *    - Rating score = averageReview × 0.4 → up to +2 pts (5 stars × 0.4 = 2)
 *
 * 2. Collaborative-filtering score (max 5 pts)
 *    - Finds all orders that contained the seed product
 *    - Counts how many of those orders also contained each other product
 *      (purchase co-occurrence)
 *    - co_score = min(coOccurrenceCount × 1.5, 5)  → capped at 5 pts
 *
 * Final hybrid score = content_score + cf_score
 * Products are sorted descending by hybrid score; top `limit` returned.
 * The seed product itself is excluded from results.
 */
const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);

    // 1. Load the seed product
    const seedProduct = await Product.findById(productId);
    if (!seedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Collaborative filtering — purchase co-occurrence
    //    Find orders containing the seed product, collect co-purchased product IDs
    const ordersWithSeed = await Order.find({
      "cartItems.productId": productId,
      paymentStatus: "paid",
    }).select("cartItems");

    // Count how many times each other product appeared alongside the seed
    const coOccurrenceMap = {};
    for (const order of ordersWithSeed) {
      for (const item of order.cartItems) {
        if (item.productId !== productId) {
          coOccurrenceMap[item.productId] =
            (coOccurrenceMap[item.productId] || 0) + 1;
        }
      }
    }

    // 3. Load all products except the seed
    const allProducts = await Product.find({ _id: { $ne: productId } });

    // 4. Score each candidate using hybrid formula
    const scored = allProducts.map((product) => {
      const id = product._id.toString();

      // --- Content-based score (0–10) ---
      let contentScore = 0;
      if (product.category === seedProduct.category) contentScore += 5;
      if (product.brand === seedProduct.brand) contentScore += 3;
      contentScore += (product.averageReview || 0) * 0.4; // max 2 pts at 5 stars

      // --- Collaborative filtering score (0–5) ---
      const coCount = coOccurrenceMap[id] || 0;
      const cfScore = Math.min(coCount * 1.5, 5);

      // --- Hybrid score ---
      const hybridScore = contentScore + cfScore;

      return { product, hybridScore, contentScore, cfScore };
    });

    // 5. Sort by hybrid score descending, take top N
    scored.sort((a, b) => b.hybridScore - a.hybridScore);
    const topProducts = scored.slice(0, limit).map((s) => s.product);

    res.status(200).json({ success: true, data: topProducts });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

module.exports = { getFilteredProducts, getProductDetails, getRecommendations };
