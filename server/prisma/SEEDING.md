# Seed guide

Este projeto ainda nao tem `seed.ts` por decisao do time. Este arquivo deixa o contrato pronto para quem for criar a seed.

## Comandos

Depois que `server/prisma/seed.ts` existir:

```bash
corepack pnpm --dir server exec prisma db push
corepack pnpm --dir server run seed
```

Alternativa equivalente:

```bash
corepack pnpm --dir server exec prisma db seed
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

## Dados de ofertas sugeridos

Crie pelo menos 8 ofertas:

- 5 em `Sao Paulo/SP`, bairros: Vila Madalena, Pinheiros, Itaim Bibi, Perdizes, Moema.
- 1 em `Rio de Janeiro/RJ`, bairro: Ipanema ou Botafogo.
- 1 em `Curitiba/PR`, bairro: Batel.
- 1 em `Florianopolis/SC`, bairro: Centro ou Campeche.

Misture tipos: `APARTAMENTO`, `CASA`, `STUDIO`, `COBERTURA`, `TERRENO`.

Use `MediaType.FOTO` com URLs publicas de imagem. Se faltar imagem, o front tem fallback visual, mas a seed ideal deve preencher ao menos uma foto por oferta.

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

- Use `upsert` se quiser preservar dados manuais.
- Use `deleteMany` se quiser estado previsivel para QA.
- Evite depender de IDs fixos gerados manualmente; capture os objetos criados e use os IDs retornados.
- `Proposal` tem unique em `[offerId, buyerId]`, entao nao crie duas propostas do mesmo comprador para a mesma oferta.
- `SavedOffer` tambem tem unique em `[userId, offerId]`.
- `Match` tem unique em `[offerId, preferenceId]`.
- A seed deve rodar depois de `prisma db push`, porque o schema inclui analytics (`OfferView`, `OfferVisit`), salvos e notificacoes.
