import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="w-full  md:w-[160px] lg:w-[180px]  mx-auto  flex flex-col ">
      <div className="flex-grow">
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
             className="w-full h-[120px] md:h-[150px] lg:h-[170px] object-contain rounded-t-lg"
          />
        </div>
        <CardContent className="p-2 flex-grow">
          <h2 className="text-base font-bold mb-1 mt-1 line-clamp-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-1">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-sm font-semibold text-primary`}
            >
              Rs {product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-sm font-bold">Rs {product?.salePrice}</span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex justify-between items-center p-2">
          <Button
            size="sm"
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
          >
            Edit
          </Button>
          <Button size="sm" onClick={() => handleDelete(product?._id)}>Delete</Button>
        </CardFooter>
    </Card>
  );
}

export default AdminProductTile;