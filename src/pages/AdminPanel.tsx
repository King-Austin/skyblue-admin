import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
// ToastAction removed: we use simple toasts for confirm actions
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, LogOut, Loader2, Upload, Edit } from 'lucide-react';
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    short_description: '',
    full_description: '',
    price_cents: 0,
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

  // 🟣 Add new product (from modal)
  const handleAddProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setUploading(true);

    try {
      let imageUrl = newProduct.image_url;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const payload = {
        name: newProduct.name,
        short_description: newProduct.short_description,
        full_description: newProduct.full_description,
        price_cents: Number(newProduct.price_cents),
        image_url: imageUrl,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select();

      if (error) {
        toast({ title: 'Failed to add product', description: error.message });
      } else {
        toast({ title: 'Product added successfully!' });
        setProducts((prev) => [data![0], ...prev]);
        setIsAddOpen(false);
        setNewProduct({ name: '', short_description: '', full_description: '', price_cents: 0, image_url: '' });
        setSelectedFile(null);
      }
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  // 🔴 Delete product (confirm then delete)
  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const ok = window.confirm(`Delete "${product.name}"? This action cannot be undone.`);
    if (!ok) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting product', description: error.message });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Product deleted' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin) return null;

  const SkeletonCard = () => (
    <div className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-muted rounded" />
        <div className="space-y-2">
          <div className="w-40 h-4 bg-muted rounded" />
          <div className="w-24 h-4 bg-muted rounded" />
        </div>
      </div>
      <div className="w-8 h-8 bg-muted rounded" />
    </div>
  );

  // Open edit modal with selected product
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditSelectedFile(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingProduct) return;
    setUploading(true);

    try {
      let imageUrl = editingProduct.image_url;
      if (editSelectedFile) {
        imageUrl = await uploadFile(editSelectedFile);
      }

      const payload = {
        name: editingProduct.name,
        short_description: editingProduct.short_description,
        full_description: editingProduct.full_description,
        price_cents: Number(editingProduct.price_cents),
        image_url: imageUrl,
      };

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id)
        .select();

      if (error) {
        toast({ title: 'Failed to update', description: error.message });
      } else {
        // replace in local state
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data![0] : p)));
        setIsEditOpen(false);
        setEditingProduct(null);
        setEditSelectedFile(null);
        toast({ title: 'Product updated' });
      }
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message || String(err) });
    } finally {
      setUploading(false);
    }
  };

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
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add new product</DialogTitle>
                    <DialogDescription>Fill in product details and upload an image.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4 mb-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortDesc">Short Description</Label>
                      <Input
                        id="shortDesc"
                        value={newProduct.short_description}
                        onChange={(e) => setNewProduct({ ...newProduct, short_description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullDesc">Full Description</Label>
                      <Textarea
                        id="fullDesc"
                        value={newProduct.full_description}
                        onChange={(e) => setNewProduct({ ...newProduct, full_description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₦)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price_cents as any}
                        onChange={(e) => setNewProduct({ ...newProduct, price_cents: Number(e.target.value) })}
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
                            const previewUrl = URL.createObjectURL(file);
                            setNewProduct({ ...newProduct, image_url: previewUrl });
                          }
                        }}
                      />
                      {selectedFile && (
                        <div className="mt-2">
                          <img src={newProduct.image_url} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                          <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
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
                        <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={uploading}>Cancel</Button>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>


            {loading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/10">
                <p className="text-lg font-medium text-muted-foreground">
                  No products found.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first product to get started.
                </p>
                <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
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
                        <p className="text-sm text-muted-foreground">₦{product.price_cents}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" onClick={() => openEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>
        {/* Edit product modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Edit product</DialogTitle>
              <DialogDescription>Modify product details and save changes.</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="max-h-[70vh] overflow-auto">
                <form onSubmit={handleSaveEdit} className="space-y-4 mb-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input id="edit-name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-short">Short Description</Label>
                    <Input id="edit-short" value={editingProduct.short_description} onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-full">Full Description</Label>
                    <Textarea id="edit-full" value={editingProduct.full_description} onChange={(e) => setEditingProduct({ ...editingProduct, full_description: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (₦)</Label>
                    <Input id="edit-price" type="number" value={editingProduct.price_cents as any} onChange={(e) => setEditingProduct({ ...editingProduct, price_cents: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Product Image</Label>
                    <Input id="edit-image" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setEditSelectedFile(file); const preview = URL.createObjectURL(file); setEditingProduct({ ...editingProduct, image_url: preview }); } }} />
                    <div className="mt-2">
                      <img src={editingProduct.image_url} alt={editingProduct.name} className="w-24 h-24 object-cover rounded border" />
                    </div>
                  </div>
                  <DialogFooter>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={uploading}>{uploading ? 'Saving...' : 'Save changes'}</Button>
                      <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingProduct(null); setEditSelectedFile(null); }}>Cancel</Button>
                    </div>
                  </DialogFooter>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
