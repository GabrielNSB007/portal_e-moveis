# Seed guide

Este projeto tem uma seed modular para popular o ambiente local com dados consistentes de comprador, anunciante, imoveis e fluxos principais da aplicacao.

## Arquitetura

- `cities.ts`: catalogo fixo de estados, cidades e bairros.
- `imagePool.ts`: catalogo fixo de imagens com `type`, `subtype` e `tags`.
- `imagePool.ts`: tambem aceita Pexels API quando `SEED_IMAGE_PROVIDER=pexels` e `PEXELS_API_KEY` estiverem definidos.
- `propertyTemplates.ts`: templates de imoveis com regras de quartos, banheiros, vagas, area, preco e comodidades.
- `generateProperties.ts`: gerador deterministico que escolhe cidade, bairro, template e imagens menos repetidas primeiro.
- `validateProperties.ts`: validador executado antes de inserir qualquer oferta.
- `seed.ts`: orquestra usuarios, preferencias, imoveis, midias, matches, propostas, salvos, notificacoes e metricas.

## Comandos

```bash
pnpm --dir server exec prisma db push
pnpm --dir server run seed
```

Alternativa equivalente:

```bash
pnpm --dir server exec prisma db seed
```

## Contas recomendadas

Use senhas simples no ambiente local, sempre com hash via `bcrypt`.

- Comprador principal: `henrique@emoveis.app` / `123456`
- Comprador alternativo: `ana@emoveis.app` / `123456`
- Vendedor principal: `marina@emoveis.app` / `123456`
- Vendedor alternativo: `rafael@emoveis.app` / `123456`

A UI nao deve depender de um nome especifico. O Explore ja busca `/auth/profile` para exibir o nome do usuario logado.

## Ordem segura para resetar dados

Se a seed for destrutiva, limpe nessa ordem para respeitar relacoes:

1. `notification`
2. `offerVisit`
3. `offerView`
4. `savedOffer`
5. `proposal`
6. `match`
7. `preference`
8. `offerMedia`
9. `offer`
10. `passwordRecoveryCode`
11. `userProfile`
12. `user`

## Ordem recomendada para criar dados

1. Usuarios compradores e vendedores.
2. `UserProfile` para cada usuario relevante.
3. `Offer` com `OfferMedia` para vendedores.
4. `Preference` ativa para compradores.
5. `Match` entre preferencias e ofertas.
6. `Proposal` enviada por comprador para oferta ativa.
7. `SavedOffer` para a aba de salvos.
8. `Notification` para alertas reais.
9. `OfferView` e `OfferVisit` para metricas do painel anunciante.

## Cobertura minima esperada

A seed deve permitir validar estes fluxos sem cadastro manual:

- Login e registro.
- Onboarding pulado ou ja concluido via preferencia ativa.
- Explore carregando ofertas reais.
- Filtros por estado, cidade, bairro, tipo, estrutura, preco e comodidades.
- Detalhe do imovel sem mapa fake.
- Envio de proposta/interesse.
- Propostas enviadas e recebidas.
- Aceitar/recusar proposta.
- Matches reais.
- Imoveis salvos.
- Notificacoes lidas/nao lidas.
- Painel anunciante com ofertas, propostas recebidas, views e visitas.

## Dados de ofertas

A seed atual cria 170 ofertas deterministicas:

- Todas as cidades cadastradas em `client/src/lib/location-options.ts`.
- Pelo menos 3 imoveis por cidade cadastrada, variando bairros.
- Recife recebe volume extra de imoveis nos mesmos bairros, sem criar bairros adicionais.
- Cada oferta recebe 2 fotos vindas do catalogo fixo.
- Imagens sao escolhidas por compatibilidade, subtipo, comodidades, busca original e menor uso acumulado.
- O gerador evita reutilizar imagens no mesmo estado, na mesma cidade e nas ofertas vizinhas; o validador bloqueia essas repeticoes antes do insert.
- Com Pexels ativo, a seed busca fotos por subtipo e adiciona `Fotos via Pexels: https://www.pexels.com` na descricao do imovel.
- O script falha antes de inserir no banco se houver inconsistencia.

## Imagens via Pexels

Sem chave, a seed usa o catalogo fixo versionado. Para buscar imagens novas via Pexels:

```bash
$env:SEED_IMAGE_PROVIDER="pexels"
$env:PEXELS_API_KEY="sua-chave"
pnpm --dir server run seed
```

Ao usar imagens de API externa, mantenha atribuicao visivel na UI/descricao conforme a regra do provedor.

Misture tipos: `APARTAMENTO`, `CASA`, `STUDIO`, `COBERTURA`, `TERRENO`.

## Preferencias recomendadas

Para o comprador principal, crie uma preferencia ativa em `Sao Paulo/SP` com:

- `minPrice`: 150000
- `maxPrice`: 1500000
- `minAreaM2`: 35
- `maxAreaM2`: 180
- `minBedrooms`: 2
- `minBathrooms`: 1
- `minParkingSpots`: 1
- `propertyTypes`: `APARTAMENTO`, `COBERTURA`, `STUDIO`
- `neighborhoods`: Vila Madalena, Pinheiros, Itaim Bibi, Perdizes
- `desiredAmenities`: PISCINA, ACADEMIA, PORTARIA, PET_FRIENDLY, VARANDA

## Observacoes importantes

- A seed atual usa `deleteMany`, entao ela reseta dados locais antes de popular o banco.
- A validacao roda antes do insert de ofertas e cobre subtipo, imagem, area, preco, quartos e categoria.
- Evite depender de IDs fixos gerados manualmente; capture os objetos criados e use os IDs retornados.
- `Proposal` tem unique em `[offerId, buyerId]`, entao nao crie duas propostas do mesmo comprador para a mesma oferta.
- `SavedOffer` tambem tem unique em `[userId, offerId]`.
- `Match` tem unique em `[offerId, preferenceId]`.
- A seed deve rodar depois de `prisma db push`, porque o schema inclui analytics (`OfferView`, `OfferVisit`), salvos e notificacoes.
