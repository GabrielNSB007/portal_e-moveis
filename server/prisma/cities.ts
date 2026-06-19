export type CityCatalogItem = {
  state: string;
  city: string;
  basePrice: number;
  extraWeight?: number;
  neighborhoods: string[];
};

export const CITY_CATALOG: CityCatalogItem[] = [
  { state: "SP", city: "Sao Paulo", basePrice: 980000, neighborhoods: ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Vila Olimpia", "Alto de Pinheiros", "Moema", "Brooklin", "Higienopolis", "Jardins", "Tatuape", "Santana"] },
  { state: "SP", city: "Campinas", basePrice: 610000, neighborhoods: ["Cambui", "Taquaral", "Barao Geraldo", "Sousas", "Nova Campinas", "Mansoes Santo Antonio", "Guanabara", "Botafogo"] },
  { state: "SP", city: "Santos", basePrice: 760000, neighborhoods: ["Gonzaga", "Boqueirao", "Ponta da Praia", "Embare", "Aparecida", "Campo Grande", "Marape", "Jose Menino"] },
  { state: "SP", city: "Sao Bernardo do Campo", basePrice: 540000, neighborhoods: ["Centro", "Rudge Ramos", "Baeta Neves", "Nova Petropolis", "Assuncao", "Demarchi", "Anchieta", "Jardim do Mar"] },
  { state: "SP", city: "Ribeirao Preto", basePrice: 520000, neighborhoods: ["Jardim Iraja", "Centro", "Ribeirania", "Alto da Boa Vista", "Nova Alianca", "Jardim Botanico", "Sumarezinho", "Santa Cruz"] },
  { state: "SP", city: "Sorocaba", basePrice: 480000, neighborhoods: ["Campolim", "Jardim Europa", "Centro", "Santa Rosalia", "Eden", "Alem Ponte", "Jardim Faculdade", "Trujillo"] },

  { state: "RJ", city: "Rio de Janeiro", basePrice: 1100000, neighborhoods: ["Leblon", "Ipanema", "Copacabana", "Barra da Tijuca", "Botafogo", "Tijuca", "Flamengo", "Laranjeiras", "Recreio", "Jardim Botanico"] },
  { state: "RJ", city: "Niteroi", basePrice: 720000, neighborhoods: ["Icarai", "Santa Rosa", "Sao Francisco", "Charitas", "Piratininga", "Centro", "Inga", "Camboinhas"] },
  { state: "RJ", city: "Petropolis", basePrice: 560000, neighborhoods: ["Centro", "Valparaiso", "Quitandinha", "Bingen", "Itaipava", "Correas", "Retiro", "Castelanea"] },
  { state: "RJ", city: "Duque de Caxias", basePrice: 360000, neighborhoods: ["Centro", "Jardim 25 de Agosto", "Vila Sao Luis", "Parque Lafaiete", "Gramacho", "Xerem"] },
  { state: "RJ", city: "Nova Iguacu", basePrice: 340000, neighborhoods: ["Centro", "Caonze", "Jardim Tropical", "Rancho Novo", "Vila Nova", "Comendador Soares"] },

  { state: "MG", city: "Belo Horizonte", basePrice: 760000, neighborhoods: ["Savassi", "Funcionarios", "Lourdes", "Buritis", "Sion", "Anchieta", "Cidade Nova", "Belvedere", "Serra", "Pampulha"] },
  { state: "MG", city: "Nova Lima", basePrice: 980000, neighborhoods: ["Vila da Serra", "Vale do Sereno", "Jardim Canada", "Centro", "Alphaville", "Morro do Chapeu"] },
  { state: "MG", city: "Contagem", basePrice: 420000, neighborhoods: ["Eldorado", "Cabral", "Industrial", "Riacho", "Centro", "Novo Eldorado"] },
  { state: "MG", city: "Uberlandia", basePrice: 520000, neighborhoods: ["Santa Monica", "Centro", "Tibery", "Jardim Karaiba", "Saraiva", "Morada da Colina"] },
  { state: "MG", city: "Juiz de Fora", basePrice: 470000, neighborhoods: ["Centro", "Sao Mateus", "Cascatinha", "Estrela Sul", "Granbery", "Bom Pastor"] },

  { state: "PR", city: "Curitiba", basePrice: 720000, neighborhoods: ["Batel", "Agua Verde", "Cabral", "Centro Civico", "Bigorrilho", "Ecoville", "Cristo Rei", "Merces", "Juveve", "Santa Felicidade"] },
  { state: "PR", city: "Londrina", basePrice: 460000, neighborhoods: ["Gleba Palhano", "Centro", "Higienopolis", "Aeroporto", "Jardim Quebec", "Bela Suica"] },
  { state: "PR", city: "Maringa", basePrice: 500000, neighborhoods: ["Zona 01", "Zona 07", "Jardim Alvorada", "Novo Centro", "Zona 03", "Parque do Inga"] },
  { state: "PR", city: "Pinhais", basePrice: 390000, neighborhoods: ["Centro", "Weissopolis", "Vargem Grande", "Atuba", "Emiliano Perneta", "Alphaville Graciosa"] },
  { state: "PR", city: "Sao Jose dos Pinhais", basePrice: 420000, neighborhoods: ["Centro", "Afonso Pena", "Sao Pedro", "Bom Jesus", "Aristocrata", "Cidade Jardim"] },

  { state: "RS", city: "Porto Alegre", basePrice: 690000, neighborhoods: ["Moinhos de Vento", "Bela Vista", "Menino Deus", "Petropolis", "Rio Branco", "Boa Vista", "Tristeza", "Centro Historico", "Auxiliadora", "Tres Figueiras"] },
  { state: "RS", city: "Canoas", basePrice: 390000, neighborhoods: ["Centro", "Marechal Rondon", "Igara", "Niteroi", "Nossa Senhora das Gracas", "Fatima"] },
  { state: "RS", city: "Caxias do Sul", basePrice: 450000, neighborhoods: ["Centro", "Exposicao", "Madureira", "Sao Pelegrino", "Panazzolo", "Pio X"] },
  { state: "RS", city: "Gramado", basePrice: 820000, neighborhoods: ["Centro", "Planalto", "Bavaria", "Carniel", "Floresta", "Avenida Central"] },
  { state: "RS", city: "Pelotas", basePrice: 360000, neighborhoods: ["Centro", "Tres Vendas", "Areal", "Fragata", "Laranjal", "Porto"] },

  { state: "SC", city: "Florianopolis", basePrice: 890000, neighborhoods: ["Centro", "Trindade", "Agronomica", "Coqueiros", "Campeche", "Itacorubi", "Joao Paulo", "Lagoa da Conceicao", "Jurere", "Ingleses"] },
  { state: "SC", city: "Sao Jose", basePrice: 520000, neighborhoods: ["Campinas", "Kobrasol", "Barreiros", "Praia Comprida", "Forquilhinhas", "Centro"] },
  { state: "SC", city: "Balneario Camboriu", basePrice: 1300000, neighborhoods: ["Centro", "Barra Sul", "Pioneiros", "Nacoes", "Praia dos Amores", "Estados"] },
  { state: "SC", city: "Joinville", basePrice: 460000, neighborhoods: ["America", "Anita Garibaldi", "Atiradores", "Centro", "Saguacu", "Costa e Silva"] },
  { state: "SC", city: "Blumenau", basePrice: 430000, neighborhoods: ["Centro", "Victor Konder", "Velha", "Ponta Aguda", "Garcia", "Itoupava Seca"] },

  { state: "BA", city: "Salvador", basePrice: 680000, neighborhoods: ["Barra", "Pituba", "Rio Vermelho", "Ondina", "Caminho das Arvores", "Horto Florestal", "Itaigara", "Imbui", "Stella Maris", "Patamares"] },
  { state: "BA", city: "Lauro de Freitas", basePrice: 520000, neighborhoods: ["Vilas do Atlantico", "Buraquinho", "Ipitanga", "Centro", "Jardim Aeroporto", "Miragem"] },
  { state: "BA", city: "Feira de Santana", basePrice: 350000, neighborhoods: ["Centro", "Santa Monica", "Kalilandia", "SIM", "Muchila", "Capuchinhos"] },
  { state: "BA", city: "Vitoria da Conquista", basePrice: 330000, neighborhoods: ["Candeias", "Recreio", "Centro", "Boa Vista", "Brasil", "Felicia"] },

  { state: "PE", city: "Recife", basePrice: 720000, extraWeight: 28, neighborhoods: ["Boa Viagem", "Pina", "Casa Forte", "Gracas", "Espinheiro", "Aflitos", "Madalena", "Derby", "Parnamirim", "Ilha do Retiro"] },
  { state: "PE", city: "Olinda", basePrice: 470000, extraWeight: 3, neighborhoods: ["Bairro Novo", "Casa Caiada", "Rio Doce", "Jardim Atlantico", "Carmo", "Amparo", "Varadouro", "Peixinhos", "Ouro Preto", "Bultrins"] },
  { state: "PE", city: "Jaboatao dos Guararapes", basePrice: 520000, extraWeight: 3, neighborhoods: ["Piedade", "Candeias", "Barra de Jangada", "Prazeres", "Muribeca", "Curado", "Cavaleiro", "Jardim Piedade", "Guararapes", "Sotave"] },
  { state: "PE", city: "Caruaru", basePrice: 390000, extraWeight: 2, neighborhoods: ["Mauricio de Nassau", "Indianopolis", "Universitario", "Boa Vista", "Centro", "Divinopolis", "Salgado", "Rendeiras", "Nova Caruaru", "Agamenon"] },

  { state: "CE", city: "Fortaleza", basePrice: 650000, neighborhoods: ["Meireles", "Aldeota", "Coco", "Mucuripe", "Varjota", "Dionisio Torres", "Guararapes", "Papicu", "Praia de Iracema", "Cambeba"] },
  { state: "CE", city: "Eusebio", basePrice: 530000, neighborhoods: ["Centro", "Coite", "Tamatanduba", "Guaribas", "Mangabeira", "Encantada"] },
  { state: "CE", city: "Caucaia", basePrice: 360000, neighborhoods: ["Cumbuco", "Icarai", "Centro", "Tabapua", "Jurema", "Parque Potira"] },
  { state: "CE", city: "Juazeiro do Norte", basePrice: 320000, neighborhoods: ["Lagoa Seca", "Centro", "Triangulo", "Sao Miguel", "Salesianos", "Cidade Universitaria"] },
];
