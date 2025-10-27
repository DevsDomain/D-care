import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Filter,
  Shield,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CaregiverCard } from "@/components/common/CaregiverCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { mockApi } from "@/lib/api/mock";
import { fetchCaregiversFromAPI } from "@/lib/api/search";
import type { Caregiver, SearchFilters } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";

export default function Search() {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const useSearchFilters = useAppStore((state) => state.searchFilters);
  const globalFilters = useSearchFilters || {};

  const [filters, setFilters] = useState<SearchFilters>({
    distanceKm: 10,
    verified: false,
    emergency: false,
    rating: 0,
    ...globalFilters,
  });

  useEffect(() => {
    searchCaregivers();
  }, [filters]);

  const searchCaregivers = async () => {
    try {
      setIsLoading(true);

      const response = await fetchCaregiversFromAPI({
        maxDistance: filters.distanceKm ? filters.distanceKm * 1000 : undefined, // km → metros
        minRating: filters.rating ?? undefined,
        availableForEmergency: filters.emergency ?? undefined,
        specialization: searchQuery || undefined,
      });

      setCaregivers(response);
    } catch (error) {
      console.error("❌ Erro ao buscar cuidadores:", error);
      setCaregivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCaregiverSelect = (caregiver: Caregiver) => {
    navigate(`/caregiver/${caregiver.id}`);
  };

  const handleBookCaregiver = (caregiver: Caregiver) => {
    navigate(`/book/${caregiver.id}`);
  };

  const filteredCaregivers = caregivers.filter(
    (caregiver) =>
      searchQuery === "" ||
      caregiver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiver.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white sticky top-0 z-40">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Buscar Cuidadores</h1>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <Input
              placeholder="Buscar por nome ou especialidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12"
            />
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Filters Bar */}
        <div className="flex items-center gap-3 mb-6">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros de Busca</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Distance */}
                <div className="space-y-3">
                  <Label>Distância máxima: {filters.distanceKm}km</Label>
                  <Slider
                    value={[filters.distanceKm || 10]}
                    onValueChange={([value]) =>
                      handleFilterChange("distanceKm", value)
                    }
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <Label>Avaliação mínima: {filters.rating} estrelas</Label>
                  <Slider
                    value={[filters.rating || 0]}
                    onValueChange={([value]) =>
                      handleFilterChange("rating", value)
                    }
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-trust-blue" />
                      <Label>Apenas verificados</Label>
                    </div>
                    <Switch
                      checked={filters.verified}
                      onCheckedChange={(checked) =>
                        handleFilterChange("verified", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-medical-critical" />
                      <Label>Disponível para emergência</Label>
                    </div>
                    <Switch
                      checked={filters.emergency}
                      onCheckedChange={(checked) =>
                        handleFilterChange("emergency", checked)
                      }
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilters({
                        distanceKm: 10,
                        verified: false,
                        emergency: false,
                        rating: 0,
                      });
                    }}
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="healthcare"
                    className="flex-1"
                    onClick={() => setShowFilters(false)}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filters.verified ? "healthcare" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("verified", !filters.verified)}
            >
              <Shield className="w-3 h-3 mr-1" />
              Verificados
            </Button>

            <Button
              variant={filters.emergency ? "emergency" : "outline"}
              size="sm"
              onClick={() =>
                handleFilterChange("emergency", !filters.emergency)
              }
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Emergência
            </Button>

            <Button
              variant={
                filters.rating && filters.rating >= 4 ? "warning" : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange("rating", filters.rating! >= 4 ? 0 : 4)
              }
            >
              <Star className="w-3 h-3 mr-1" />
              4+ estrelas
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <ListSkeleton type="caregiver" count={3} />
        ) : filteredCaregivers.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="Nenhum cuidador encontrado"
            description="Tente ajustar os filtros ou alterar os critérios de busca."
            actionLabel="Limpar filtros"
            onAction={() => {
              setFilters({
                distanceKm: 10,
                verified: false,
                emergency: false,
                rating: 0,
              });
              setSearchQuery("");
            }}
            variant="search"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredCaregivers.length} cuidador
                {filteredCaregivers.length !== 1 ? "es" : ""} encontrado
                {filteredCaregivers.length !== 1 ? "s" : ""}
              </p>

              <Select defaultValue="distance">
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distância</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredCaregivers.map((caregiver) => (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                  onSelect={handleCaregiverSelect}
                  onBook={handleBookCaregiver}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
