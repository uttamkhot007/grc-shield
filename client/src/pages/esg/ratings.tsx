import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Award, Plus, Download, TrendingUp, TrendingDown, ExternalLink, Star
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgRating } from "@shared/schema";

export default function RatingsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: ratings = [], isLoading } = useQuery<EsgRating[]>({
    queryKey: ["/api/esg/ratings"],
  });

  const addRatingMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/ratings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/ratings"] });
      setIsAddDialogOpen(false);
      toast({ title: "ESG rating added successfully" });
    },
  });

  const latestRatings = ratings.reduce((acc, r) => {
    if (!acc[r.agency || ''] || new Date(r.ratingDate || '') > new Date(acc[r.agency || ''].ratingDate || '')) {
      acc[r.agency || ''] = r;
    }
    return acc;
  }, {} as Record<string, EsgRating>);

  const agencyCount = Object.keys(latestRatings).length;

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-amber-500/20 mb-4">
          <Award className="w-12 h-12 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ESG Ratings</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track your organization's ESG ratings from agencies like MSCI, Sustainalytics, 
          CDP, and others to benchmark performance.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-rating">
          <Plus className="w-4 h-4 mr-2" />
          Add Rating
        </Button>
      </CardContent>
    </Card>
  );

  const getRatingColor = (rating: string) => {
    if (rating.includes("AAA") || rating.includes("A+") || rating === "Leader") return "text-green-500";
    if (rating.includes("AA") || rating.includes("A") || rating === "A") return "text-green-400";
    if (rating.includes("BBB") || rating.includes("B+") || rating === "B") return "text-yellow-500";
    if (rating.includes("BB") || rating.includes("B")) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            ESG Ratings
          </h1>
          <p className="text-muted-foreground mt-1">
            Track external ESG ratings and benchmarks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-rating">
                <Plus className="w-4 h-4 mr-2" />
                Add Rating
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add ESG Rating</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addRatingMutation.mutate({
                    agency: formData.get("agency"),
                    rating: formData.get("rating"),
                    score: parseInt(formData.get("score") as string) || null,
                    ratingDate: formData.get("ratingDate"),
                    previousRating: formData.get("previousRating") || null,
                    trend: formData.get("trend"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rating Agency</Label>
                    <Select name="agency" defaultValue="msci">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="msci">MSCI</SelectItem>
                        <SelectItem value="sustainalytics">Sustainalytics</SelectItem>
                        <SelectItem value="cdp">CDP</SelectItem>
                        <SelectItem value="sp_global">S&P Global</SelectItem>
                        <SelectItem value="iss">ISS</SelectItem>
                        <SelectItem value="moody">Moody's</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <Input name="rating" placeholder="e.g., AA, B+, Leader" required data-testid="input-rating" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Score (optional)</Label>
                    <Input name="score" type="number" placeholder="0-100" data-testid="input-score" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating Date</Label>
                    <Input name="ratingDate" type="date" required data-testid="input-date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Previous Rating</Label>
                    <Input name="previousRating" placeholder="e.g., A, B+" data-testid="input-previous" />
                  </div>
                  <div className="space-y-2">
                    <Label>Trend</Label>
                    <Select name="trend" defaultValue="stable">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="improving">Improving</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="declining">Declining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addRatingMutation.isPending}>
                    {addRatingMutation.isPending ? "Adding..." : "Add Rating"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading ratings...</CardContent>
        </Card>
      ) : ratings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ratings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Ratings</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agencyCount}</p>
                  <p className="text-sm text-muted-foreground">Agencies</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ratings.filter(r => r.trend === "improving").length}</p>
                  <p className="text-sm text-muted-foreground">Improving</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ratings.filter(r => r.trend === "declining").length}</p>
                  <p className="text-sm text-muted-foreground">Declining</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(latestRatings).map((rating) => (
              <Card key={rating.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold uppercase">{rating.agency}</h3>
                    {rating.trend === "improving" && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {rating.trend === "declining" && <TrendingDown className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getRatingColor(rating.rating || '')}`}>
                    {rating.rating}
                  </div>
                  {rating.score && (
                    <p className="text-sm text-muted-foreground mb-2">Score: {rating.score}/100</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {rating.previousRating && (
                      <>
                        <span>Previous: {rating.previousRating}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Rating History</CardTitle>
              <CardDescription>All ESG ratings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-medium uppercase">{rating.agency}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getRatingColor(rating.rating || '')}`}>
                          {rating.rating}
                        </span>
                      </TableCell>
                      <TableCell>{rating.score || '-'}</TableCell>
                      <TableCell>{rating.previousRating || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={rating.trend === "improving" ? "default" : rating.trend === "declining" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {rating.trend}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
