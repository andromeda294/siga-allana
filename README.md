# Ritmo

Aplicação móvel para acompanhar refeições, nutrientes, hidratação e evolução do peso numa rotina diária.

## Funcionalidades

- Registo e edição de refeições, calorias e macronutrientes.
- Resumo diário com metas personalizáveis e histórico pesquisável.
- Registo de água e acompanhamento de metas de hidratação.
- Perfil com altura, peso atual, meta de peso e histórico de medições.
- Temas claro, escuro ou conforme as definições do dispositivo.
- Lembretes locais opcionais para água e refeições.

Os registos e as definições são guardados no dispositivo. Não existe sincronização entre dispositivos nem cópia de segurança online; desinstalar a aplicação pode remover os dados locais.

## Desenvolvimento

```bash
yarn install
npx expo start
```

Os lembretes são notificações locais e só funcionam nas aplicações Android e iOS. A permissão é pedida quando a pessoa ativa e guarda um lembrete.
