import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products as initialProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

const Index = () => {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchOnly, setSearchOnly] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, short_description, full_description, price_cents, image_url')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name ?? p.title ?? 'Untitled',
            shortDescription: p.short_description ?? '',
            fullDescription: p.full_description ?? '',
            price: p.price_cents ? Number(p.price_cents) : 0,
            image: p.image_url ?? '/src/assets/placeholder.svg'
          }));

          setProducts(mapped);
          try { localStorage.setItem('products', JSON.stringify(mapped)); } catch { }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <Link to="/login">
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Our Premium Solar Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality solar energy products designed to power your sustainable future
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <input
            aria-label="Search products"
            placeholder="Search products..."
            className="w-full md:w-1/2 border rounded px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setSearch('')} variant="outline">Clear</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">Loading products...</div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : (
          <FilteredGrid products={products} search={search} />
        )}
      </div>

      <footer className="border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SkyBlue Shop</span>
          <span className="mx-2">·</span>
          <span>Powered by WebSync Inc</span>
        </div>
      </footer>
    </div>
  );
};

const FilteredGrid = ({ products, search }: any) => {
  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    let list = products.slice();

    if (q) {
      list = list.filter((p: any) =>
        (p.name || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, search]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filtered.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Index;
