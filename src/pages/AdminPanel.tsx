import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, LogOut, Loader2, Upload } from 'lucide-react';
import { supabase, uploadFile } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  price_cents: number;
  image_url: string;
}

const AdminPanel = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    short_description: '',
    full_description: '',
    price_cents: '',
    image_url: '',
  });

  // 🟢 Fetch products from Supabase
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error fetching products', description: error.message });
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [isAdmin, navigate, toast]);

  // 🟣 Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = newProduct.image_url;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...newProduct,
          image_url: imageUrl
        }])
        .select();

      if (error) {
        toast({ title: 'Failed to add product', description: error.message });
      } else {
        toast({ title: 'Product added successfully!' });
        setProducts([data![0], ...products]);
        setShowAddForm(false);
        setNewProduct({
          name: '',
          short_description: '',
          full_description: '',
          price_cents: 0,
          image_url: '',
        });
        setSelectedFile(null);
      }
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  // 🔴 Delete product
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting product', description: error.message });
    } else {
      toast({ title: 'Product deleted successfully' });
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="text-muted-foreground">📦</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total inventory value</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                    products.reduce((sum, p) => sum + (p.price_cents || 0), 0)
                  )}</p>
                </div>
                <div className="text-muted-foreground">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manage Products</CardTitle>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <form
                onSubmit={handleAddProduct}
                className="space-y-4 mb-6 p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <Input
                    id="shortDesc"
                    value={newProduct.short_description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        short_description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullDesc">Full Description</Label>
                  <Textarea
                    id="fullDesc"
                    value={newProduct.full_description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        full_description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price_cents}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price_cents: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        setNewProduct({ ...newProduct, image_url: previewUrl });
                      }
                    }}
                    required={!newProduct.image_url}
                  />
                  {selectedFile && (
                    <div className="mt-2">
                      <img
                        src={newProduct.image_url}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/10">
                <p className="text-lg font-medium text-muted-foreground">
                  No products found.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first product to get started.
                </p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₦{product.price_cents}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
