import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

type ChartPoint = { label: string; value: number; color?: string };

const DEFAULT_COLORS = [
  "#E89B7E",
  "#D97757",
  "#F2C5A8",
  "#A8746A",
  "#C58B6F",
  "#E5B299",
];

type Comment = { id: string; author: string; text: string; createdAt: string };

type Post = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  body: string;
  videoUrl?: string;
  videoFile?: string;
  chartTitle?: string;
  chartData?: ChartPoint[];
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
};

const initialPosts: Post[] = [];

function parseDrive(url: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("drive.google.com")) return undefined;
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    const id = m?.[1] || u.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
  } catch {
    return undefined;
  }
  return undefined;
}

const COLOR_MAP: Record<string, string> = {
  azul: "#3B82F6",
  vermelho: "#EF4444",
  verde: "#22C55E",
  amarelo: "#EAB308",
  laranja: "#F97316",
  roxo: "#8B5CF6",
  rosa: "#EC4899",
  salmao: "#E89B7E",
  salmão: "#E89B7E",
  cinza: "#6B7280",
  preto: "#111827",
  branco: "#F9FAFB",
  marrom: "#92400E",
  ciano: "#06B6D4",
  turquesa: "#14B8A6",
};

function parseChart(raw: string): ChartPoint[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, value, color] = line.split(",").map((s) => s?.trim());
      const key = color?.toLowerCase();
      const c = key ? COLOR_MAP[key] : undefined;
      return { label: label ?? "", value: Number(value) || 0, color: c };
    })
    .filter((p) => p.label);
}

const Index = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("diario-admin") === "1",
  );
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [videoFile, setVideoFile] = useState<string | undefined>(undefined);
  const [chartTitle, setChartTitle] = useState("");
  const [chartRaw, setChartRaw] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("diario-admin");
    setIsAdmin(false);
    toast.success("Logout realizado");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Título e texto são obrigatórios");
      return;
    }
    const chartData = parseChart(chartRaw);
    const newPost: Post = {
      id: crypto.randomUUID(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      author: author.trim() || "Redação",
      category: category.trim() || "Política",
      body: body.trim(),
      videoUrl: parseDrive(video.trim()),
      videoFile,
      chartTitle: chartTitle.trim() || undefined,
      chartData: chartData.length ? chartData : undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setTitle("");
    setSubtitle("");
    setAuthor("");
    setCategory("");
    setBody("");
    setVideo("");
    setVideoFile(undefined);
    setChartTitle("");
    setChartRaw("");
    toast.success("Notícia publicada");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Editorial · Política
              </p>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl text-foreground">
                Diário
              </h1>
              <p className="mt-2 text-muted-foreground">
                Notícias, vídeos e infográficos sobre o cenário político.
              </p>
            </div>
            <div className="shrink-0">
              {isAdmin ? (
                <div className="flex flex-col items-end gap-2">
                  <Badge>Admin</Badge>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                  Login admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            {isAdmin && <TabsTrigger value="new">Nova publicação</TabsTrigger>}
          </TabsList>

          <TabsContent value="feed" className="space-y-10">
            {posts.length === 0 && (
              <p className="text-muted-foreground">Nenhuma notícia publicada.</p>
            )}
            {posts.map((p) => (
              <article
                key={p.id}
                className="rounded-lg border border-border bg-card p-8 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge>{p.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPosts((prev) => prev.filter((x) => x.id !== p.id));
                        toast.success("Notícia removida");
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <h2 className="mt-4 font-serif text-3xl text-foreground">
                  {p.title}
                </h2>
                {p.subtitle && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {p.subtitle}
                  </p>
                )}
                <p className="mt-3 text-sm text-foreground/70">
                  Por <span className="font-medium">{p.author}</span>
                </p>

                <div className="mt-6 space-y-4 text-foreground leading-relaxed">
                  {p.body.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {p.videoFile ? (
                  <div className="mt-8 overflow-hidden rounded-md border border-border">
                    <video src={p.videoFile} controls className="h-full w-full" />
                  </div>
                ) : p.videoUrl ? (
                  <div className="mt-8 aspect-video overflow-hidden rounded-md border border-border">
                    <iframe
                      src={p.videoUrl}
                      title="vídeo"
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                {p.chartData && p.chartData.length > 0 && (
                  <div className="mt-8 rounded-md bg-secondary p-6">
                    {p.chartTitle && (
                      <h3 className="mb-4 font-serif text-xl text-secondary-foreground">
                        {p.chartTitle}
                      </h3>
                    )}
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={p.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                            }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {p.chartData.map((entry, idx) => (
                              <Cell
                                key={idx}
                                fill={entry.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={p.likedByMe ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setPosts((prev) =>
                          prev.map((x) =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  likedByMe: !x.likedByMe,
                                  likes: x.likes + (x.likedByMe ? -1 : 1),
                                }
                              : x,
                          ),
                        )
                      }
                    >
                      ♥ {p.likes}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {p.comments.length} comentário{p.comments.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <form
                    className="mt-4 grid gap-2 md:grid-cols-[1fr_2fr_auto]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const fd = new FormData(form);
                      const cAuthor = String(fd.get("cAuthor") || "").trim() || "Anônimo";
                      const cText = String(fd.get("cText") || "").trim();
                      if (!cText) {
                        toast.error("Escreva um comentário");
                        return;
                      }
                      const newComment: Comment = {
                        id: crypto.randomUUID(),
                        author: cAuthor,
                        text: cText,
                        createdAt: new Date().toISOString(),
                      };
                      setPosts((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, comments: [...x.comments, newComment] } : x,
                        ),
                      );
                      form.reset();
                    }}
                  >
                    <Input name="cAuthor" placeholder="Seu nome" maxLength={60} />
                    <Input name="cText" placeholder="Escreva um comentário" maxLength={500} />
                    <Button type="submit" size="sm">Comentar</Button>
                  </form>

                  {p.comments.length > 0 && (
                    <ul className="mt-5 space-y-3">
                      {p.comments.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-md bg-secondary p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-secondary-foreground">
                              {c.author}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(c.createdAt).toLocaleString("pt-BR")}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    setPosts((prev) =>
                                      prev.map((x) =>
                                        x.id === p.id
                                          ? { ...x, comments: x.comments.filter((k) => k.id !== c.id) }
                                          : x,
                                      ),
                                    )
                                  }
                                >
                                  remover
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-foreground/80">{c.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  Nova publicação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Manchete da notícia"
                      maxLength={200}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Input
                      id="subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      maxLength={300}
                    />
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="author">Autor</Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Eleições"
                        maxLength={50}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="body">Texto *</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      placeholder="Escreva a matéria. Separe parágrafos com Enter."
                      maxLength={10000}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="video">Vídeo do Google Drive (URL)</Label>
                    <Input
                      id="video"
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                    />
                    <p className="text-xs text-muted-foreground">
                      Compartilhe o arquivo como "Qualquer pessoa com o link" para reproduzir.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="videoFile">Ou envie um vídeo do computador</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) {
                          setVideoFile(undefined);
                          return;
                        }
                        if (f.size > 50 * 1024 * 1024) {
                          toast.error("Vídeo muito grande (máx. 50MB)");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => setVideoFile(reader.result as string);
                        reader.readAsDataURL(f);
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chartTitle">Título do infográfico</Label>
                    <Input
                      id="chartTitle"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      maxLength={120}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chartRaw">Dados do infográfico</Label>
                    <Textarea
                      id="chartRaw"
                      value={chartRaw}
                      onChange={(e) => setChartRaw(e.target.value)}
                      rows={5}
                      placeholder={"Um por linha: rótulo, valor, cor (opcional)\nGoverno, 248, azul\nOposição, 132, vermelho"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cores: azul, vermelho, verde, amarelo, laranja, roxo, rosa, salmão, cinza, preto, marrom, ciano, turquesa.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      Publicar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Diário
      </footer>
    </div>
  );
};

export default Index;
