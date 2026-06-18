export const STATE_OPTIONS = [
  { value: "SP", label: "Sao Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PR", label: "Parana" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "BA", label: "Bahia" },
  { value: "PE", label: "Pernambuco" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
] as const;

export const CITIES_BY_STATE: Record<string, string[]> = {
  SP: ["Sao Paulo", "Campinas", "Santos", "Sao Bernardo do Campo", "Ribeirao Preto", "Sorocaba"],
  RJ: ["Rio de Janeiro", "Niteroi", "Petropolis", "Duque de Caxias", "Nova Iguacu"],
  MG: ["Belo Horizonte", "Nova Lima", "Contagem", "Uberlandia", "Juiz de Fora"],
  PR: ["Curitiba", "Londrina", "Maringa", "Pinhais", "Sao Jose dos Pinhais"],
  RS: ["Porto Alegre", "Canoas", "Caxias do Sul", "Gramado", "Pelotas"],
  SC: ["Florianopolis", "Sao Jose", "Balneario Camboriu", "Joinville", "Blumenau"],
  BA: ["Salvador", "Lauro de Freitas", "Feira de Santana", "Vitoria da Conquista"],
  PE: ["Recife", "Olinda", "Jaboatao dos Guararapes", "Caruaru"],
  CE: ["Fortaleza", "Eusebio", "Caucaia", "Juazeiro do Norte"],
  DF: ["Brasilia", "Aguas Claras", "Taguatinga", "Guara", "Lago Sul"],
};

export const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "Sao Paulo": ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros", "Moema", "Brooklin", "Higienopolis", "Jardins"],
  "Rio de Janeiro": ["Leblon", "Ipanema", "Copacabana", "Barra da Tijuca", "Botafogo", "Tijuca", "Flamengo", "Laranjeiras", "Recreio", "Jardim Botanico"],
  Curitiba: ["Batel", "Agua Verde", "Cabral", "Centro Civico", "Bigorrilho", "Ecoville", "Cristo Rei", "Merces", "Juveve", "Santa Felicidade"],
  "Belo Horizonte": ["Savassi", "Funcionarios", "Lourdes", "Buritis", "Sion", "Anchieta", "Cidade Nova", "Belvedere", "Serra", "Pampulha"],
  "Porto Alegre": ["Moinhos de Vento", "Bela Vista", "Menino Deus", "Petropolis", "Rio Branco", "Boa Vista", "Tristeza", "Centro Historico", "Auxiliadora", "Tres Figueiras"],
  Florianopolis: ["Centro", "Trindade", "Agronomica", "Coqueiros", "Campeche", "Itacorubi", "Joao Paulo", "Lagoa da Conceicao", "Jurer?", "Ingleses"],
  Brasilia: ["Asa Sul", "Asa Norte", "Noroeste", "Sudoeste", "Lago Sul", "Lago Norte", "Aguas Claras", "Guara", "Taguatinga", "Park Sul"],
};

export const DEFAULT_STATE = "SP";
export const DEFAULT_CITY = "Sao Paulo";

export const citiesForState = (state: string) => CITIES_BY_STATE[state] ?? CITIES_BY_STATE[DEFAULT_STATE];
export const neighborhoodsForCity = (city: string) => NEIGHBORHOODS_BY_CITY[city] ?? [];
