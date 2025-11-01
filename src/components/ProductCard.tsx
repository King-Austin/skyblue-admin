import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden border-2 border-border hover-lift hover-glow">
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground">{product.name}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2 min-h-[3rem]">
          {product.shortDescription}
        </p>
        <p className="text-2xl font-bold text-primary">₦{product.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link to={`/product/${product.id}`} className="w-full">
          <Button className="w-full rounded-lg font-medium">
            View More Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
