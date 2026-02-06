'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  LayoutTemplate,
  Calendar,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { getPosts } from '@/lib/post';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post {
  id: number;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: string;
  createdAt: string;
  category: { name: string } | null;
  readTime: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // --- CARREGAMENTO ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts();
      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- AÇÕES ---
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir', error);
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.put(`/posts/${id}`, { status: newStatus });
      setPosts(
        posts.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)),
      );
    } catch (error) {
      console.error('Erro ao atualizar status', error);
    }
  };

  // --- FILTROS ---
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const title = post.title ? String(post.title).toLowerCase() : '';
      const author = post.author ? String(post.author).toLowerCase() : '';
      const searchLower = search.toLowerCase();
      
      const matchesSearch = title.includes(searchLower) || author.includes(searchLower);
      const matchesStatus = statusFilter === 'todos' || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  // --- COMPONENTES VISUAIS ---
  const getStatusBadge = (status: string) => {
    const isPublished = status === 'PUBLISHED';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${
        isPublished 
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      }`}>
        {isPublished ? <CheckCircle size={10} /> : <Edit3 size={10} />}
        {isPublished ? 'Publicado' : 'Rascunho'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-auto  bg-background text-foreground">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <LayoutTemplate className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o conteúdo e notícias do portal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Buscar por título..."
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro de Status */}
          <select
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Rascunhos</option>
          </select>

          {/* Botão Novo */}
          <Link href="/main/posts/new">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-sm text-sm">
              <Plus size={16} />
              <span>Novo Artigo</span>
            </button>
          </Link>
        </div>
      </header>

      {/* --- STATS CARDS (Estilo Grid) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FileText size={20} /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
              <h3 className="text-2xl font-bold">{posts.length}</h3>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle size={20} /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Publicados</p>
              <h3 className="text-2xl font-bold">{posts.filter(p => p.status === 'PUBLISHED').length}</h3>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Edit3 size={20} /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Rascunhos</p>
              <h3 className="text-2xl font-bold">{posts.filter(p => p.status === 'DRAFT').length}</h3>
            </div>
         </div>
      </div>

      {/* --- TABELA --- */}
      <main className="flex-1 overflow-auto bg-card border border-border rounded-2xl shadow-sm flex flex-col min-h-50">
        <div className="overflow-x-auto flex-1 scrollbar-thin">
           {isLoading ? (
             <div className="p-8 space-y-4">
               {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted/20 rounded-lg animate-pulse" />)}
             </div>
           ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
               <FileText size={48} className="opacity-20 mb-4" />
               <p>Nenhum post encontrado.</p>
            </div>
           ) : (
             <table className="w-full text-left border-collapse">
               <thead className="sticky top-0 bg-muted/50 backdrop-blur-md z-10">
                 <tr>
                   <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">Artigo</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">Categoria / Autor</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">Status</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">Data</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b text-right">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {filteredPosts.map((post) => (
                   <tr key={post.id} className="hover:bg-muted/20 transition-colors group">
                     {/* Título & Slug */}
                     <td className="p-4 max-w-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono truncate">
                            /{post.slug}
                          </span>
                        </div>
                     </td>

                     {/* Categoria & Autor */}
                     <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs font-semibold bg-secondary/50 px-2 py-0.5 rounded w-fit">
                             {post.category?.name || 'Geral'}
                           </span>
                           <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <User size={10} /> {post.author}
                           </div>
                        </div>
                     </td>

                     {/* Status */}
                     <td className="p-4">
                        {getStatusBadge(post.status)}
                     </td>

                     {/* Data & Tempo */}
                     <td className="p-4">
                        <div className="flex flex-col text-[11px] text-muted-foreground gap-1">
                           <span className="flex items-center gap-1">
                             <Calendar size={10} />
                             {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                           </span>
                           {post.readTime && (
                             <span className="flex items-center gap-1">
                               <Clock size={10} /> {post.readTime}
                             </span>
                           )}
                        </div>
                     </td>

                     {/* Ações */}
                     <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all">
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Gerenciar</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Link href={`/main/posts/edit/${post.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit3 className="w-4 h-4 mr-2" /> Editar
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`https://lintratech.cloud/blog/${post.slug}`} target="_blank">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="w-4 h-4 mr-2" /> Visualizar
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handleStatusChange(post.id, post.status)} className="cursor-pointer">
                                {post.status === 'PUBLISHED' ? (
                                  <><XCircle className="w-4 h-4 mr-2 text-amber-500" /> Despublicar</>
                                ) : (
                                  <><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Publicar</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Link href={`/main/posts/edit/${post.id}`} className="hidden md:block">
                            <button className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all" title="Editar">
                              <ChevronRight size={16} />
                            </button>
                          </Link>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </main>
    </div>
  );
}