import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { products as initialProducts } from "@/data/products";

const ProductDetails = () => {
  const { id } = useParams();
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = `Hi! I'm interested in the ${product.name} priced at ₦${product.price.toLocaleString()}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-secondary rounded-xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-foreground">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-primary mb-6">
                  ₦{product.price.toLocaleString()}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {product.fullDescription}
                </p>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="lg"
                  className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Order via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
