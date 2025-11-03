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
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [hasImage, setHasImage] = useState(false);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full md:w-2/3">
            <input
              aria-label="Search products"
              placeholder="Search products..."
              className="w-full md:w-1/2 border rounded px-3 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="border rounded px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hasImage} onChange={(e) => setHasImage(e.target.checked)} />
              Has image
            </label>
          </div>

          <div className="flex items-center gap-2 w-full md:w-1/3">
            <input
              aria-label="Min price"
              placeholder="Min price"
              className="w-1/3 border rounded px-3 py-2"
              value={minPrice as any}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <input
              aria-label="Max price"
              placeholder="Max price"
              className="w-1/3 border rounded px-3 py-2"
              value={maxPrice as any}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Button onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); setHasImage(false); setSort('newest'); }} variant="outline">Reset</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">Loading products...</div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : (
          <FilteredGrid products={products} search={search} sort={sort} minPrice={minPrice} maxPrice={maxPrice} hasImage={hasImage} />
        )}
      </div>
    </div>
  );
};

const FilteredGrid = ({ products, search, sort, minPrice, maxPrice, hasImage }: any) => {
  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    let list = products.slice();

    if (q) {
      list = list.filter((p: any) =>
        (p.name || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q)
      );
    }

    if (minPrice !== '') {
      list = list.filter((p: any) => (p.price || 0) >= Number(minPrice));
    }
    if (maxPrice !== '') {
      list = list.filter((p: any) => (p.price || 0) <= Number(maxPrice));
    }

    if (hasImage) {
      list = list.filter((p: any) => p.image && !String(p.image).toLowerCase().includes('placeholder'));
    }

    if (sort === 'price-asc') {
      list.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-desc') {
      list.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [products, search, sort, minPrice, maxPrice, hasImage]);

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
