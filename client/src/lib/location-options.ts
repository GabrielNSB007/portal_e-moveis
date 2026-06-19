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
};

export const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "Sao Paulo": ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros", "Moema", "Brooklin", "Higienopolis", "Jardins", "Tatuape", "Santana"],
  Campinas: ["Cambui", "Taquaral", "Barao Geraldo", "Sousas", "Nova Campinas", "Mansoes Santo Antonio", "Guanabara", "Botafogo"],
  Santos: ["Gonzaga", "Boqueirao", "Ponta da Praia", "Embare", "Aparecida", "Campo Grande", "Marape", "Jose Menino"],
  "Sao Bernardo do Campo": ["Centro", "Rudge Ramos", "Baeta Neves", "Nova Petropolis", "Assuncao", "Demarchi", "Anchieta", "Jardim do Mar"],
  "Ribeirao Preto": ["Jardim Iraja", "Centro", "Ribeirania", "Alto da Boa Vista", "Nova Alianca", "Jardim Botanico", "Sumarezinho", "Santa Cruz"],
  Sorocaba: ["Campolim", "Jardim Europa", "Centro", "Santa Rosalia", "Eden", "Alem Ponte", "Jardim Faculdade", "Trujillo"],

  "Rio de Janeiro": ["Leblon", "Ipanema", "Copacabana", "Barra da Tijuca", "Botafogo", "Tijuca", "Flamengo", "Laranjeiras", "Recreio", "Jardim Botanico"],
  Niteroi: ["Icarai", "Santa Rosa", "Sao Francisco", "Charitas", "Piratininga", "Centro", "Inga", "Camboinhas"],
  Petropolis: ["Centro", "Valparaiso", "Quitandinha", "Bingen", "Itaipava", "Correas", "Retiro", "Castelanea"],
  "Duque de Caxias": ["Centro", "Jardim 25 de Agosto", "Vila Sao Luis", "Parque Lafaiete", "Gramacho", "Xerem"],
  "Nova Iguacu": ["Centro", "Caonze", "Jardim Tropical", "Rancho Novo", "Vila Nova", "Comendador Soares"],

  "Belo Horizonte": ["Savassi", "Funcionarios", "Lourdes", "Buritis", "Sion", "Anchieta", "Cidade Nova", "Belvedere", "Serra", "Pampulha"],
  "Nova Lima": ["Vila da Serra", "Vale do Sereno", "Jardim Canada", "Centro", "Alphaville", "Morro do Chapeu"],
  Contagem: ["Eldorado", "Cabral", "Industrial", "Riacho", "Centro", "Novo Eldorado"],
  Uberlandia: ["Santa Monica", "Centro", "Tibery", "Jardim Karaiba", "Saraiva", "Morada da Colina"],
  "Juiz de Fora": ["Centro", "Sao Mateus", "Cascatinha", "Estrela Sul", "Granbery", "Bom Pastor"],

  Curitiba: ["Batel", "Agua Verde", "Cabral", "Centro Civico", "Bigorrilho", "Ecoville", "Cristo Rei", "Merces", "Juveve", "Santa Felicidade"],
  Londrina: ["Gleba Palhano", "Centro", "Higienopolis", "Aeroporto", "Jardim Quebec", "Bela Suica"],
  Maringa: ["Zona 01", "Zona 07", "Jardim Alvorada", "Novo Centro", "Zona 03", "Parque do Inga"],
  Pinhais: ["Centro", "Weissopolis", "Vargem Grande", "Atuba", "Emiliano Perneta", "Alphaville Graciosa"],
  "Sao Jose dos Pinhais": ["Centro", "Afonso Pena", "Sao Pedro", "Bom Jesus", "Aristocrata", "Cidade Jardim"],

  "Porto Alegre": ["Moinhos de Vento", "Bela Vista", "Menino Deus", "Petropolis", "Rio Branco", "Boa Vista", "Tristeza", "Centro Historico", "Auxiliadora", "Tres Figueiras"],
  Canoas: ["Centro", "Marechal Rondon", "Igara", "Niteroi", "Nossa Senhora das Gracas", "Fatima"],
  "Caxias do Sul": ["Centro", "Exposicao", "Madureira", "Sao Pelegrino", "Panazzolo", "Pio X"],
  Gramado: ["Centro", "Planalto", "Bavaria", "Carniel", "Floresta", "Avenida Central"],
  Pelotas: ["Centro", "Tres Vendas", "Areal", "Fragata", "Laranjal", "Porto"],

  Florianopolis: ["Centro", "Trindade", "Agronomica", "Coqueiros", "Campeche", "Itacorubi", "Joao Paulo", "Lagoa da Conceicao", "Jurere", "Ingleses"],
  "Sao Jose": ["Campinas", "Kobrasol", "Barreiros", "Praia Comprida", "Forquilhinhas", "Centro"],
  "Balneario Camboriu": ["Centro", "Barra Sul", "Pioneiros", "Nacoes", "Praia dos Amores", "Estados"],
  Joinville: ["America", "Anita Garibaldi", "Atiradores", "Centro", "Saguacu", "Costa e Silva"],
  Blumenau: ["Centro", "Victor Konder", "Velha", "Ponta Aguda", "Garcia", "Itoupava Seca"],

  Salvador: ["Barra", "Pituba", "Rio Vermelho", "Ondina", "Caminho das Arvores", "Horto Florestal", "Itaigara", "Imbui", "Stella Maris", "Patamares"],
  "Lauro de Freitas": ["Vilas do Atlantico", "Buraquinho", "Ipitanga", "Centro", "Jardim Aeroporto", "Miragem"],
  "Feira de Santana": ["Centro", "Santa Monica", "Kalilandia", "SIM", "Muchila", "Capuchinhos"],
  "Vitoria da Conquista": ["Candeias", "Recreio", "Centro", "Boa Vista", "Brasil", "Felicia"],

  Recife: ["Boa Viagem", "Pina", "Casa Forte", "Gracas", "Espinheiro", "Aflitos", "Madalena", "Derby", "Parnamirim", "Ilha do Retiro"],
  Olinda: ["Bairro Novo", "Casa Caiada", "Rio Doce", "Jardim Atlantico", "Carmo", "Amparo", "Varadouro", "Peixinhos", "Ouro Preto", "Bultrins"],
  "Jaboatao dos Guararapes": ["Piedade", "Candeias", "Barra de Jangada", "Prazeres", "Muribeca", "Curado", "Cavaleiro", "Jardim Piedade", "Guararapes", "Sotave"],
  Caruaru: ["Mauricio de Nassau", "Indianopolis", "Universitario", "Boa Vista", "Centro", "Divinopolis", "Salgado", "Rendeiras", "Nova Caruaru", "Agamenon"],

  Fortaleza: ["Meireles", "Aldeota", "Coco", "Mucuripe", "Varjota", "Dionisio Torres", "Guararapes", "Papicu", "Praia de Iracema", "Cambeba"],
  Eusebio: ["Centro", "Coite", "Tamatanduba", "Guaribas", "Mangabeira", "Encantada"],
  Caucaia: ["Cumbuco", "Icarai", "Centro", "Tabapua", "Jurema", "Parque Potira"],
  "Juazeiro do Norte": ["Lagoa Seca", "Centro", "Triangulo", "Sao Miguel", "Salesianos", "Cidade Universitaria"],
};

export const DEFAULT_STATE = "SP";
export const DEFAULT_CITY = "Sao Paulo";

export const citiesForState = (state: string) => CITIES_BY_STATE[state] ?? CITIES_BY_STATE[DEFAULT_STATE];
export const neighborhoodsForCity = (city: string) => NEIGHBORHOODS_BY_CITY[city] ?? [];
export const stateLabel = (state: string) => STATE_OPTIONS.find((option) => option.value === state)?.label ?? state;
