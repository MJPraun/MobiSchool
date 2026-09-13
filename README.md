# 🚐 MobiSchool — Transporte Escolar Inteligente

Aplicativo mobile multiplataforma desenvolvido em **React Native** com **Expo Router** e **Supabase**, projetado para otimizar a gestão do transporte escolar, conectando motoristas, monitores e pais em tempo real.

---

## 🚀 Tecnologias Utilizadas

* **Frontend**: React Native, Expo Router, TypeScript, Ionicons
* **Backend & Banco de Dados**: Supabase (PostgreSQL, Realtime WebSockets, Auth)
* **Gerenciamento de Estado & Navegação**: Expo File-based Routing (`app/(tabs)`)

---

## 📱 Módulos e Funcionalidades Principais

1. **Painel do Motorista (`app/(tabs)`)**:
   * **Home (`index.tsx`)**: Resumo dinâmico com contagem de alunos vinculados e rotas ativas do dia.
   * **Rotas (`rotas.tsx`)**: Listagem ordenada por parada de embarque, com escuta em tempo real via WebSocket (`Supabase Realtime`).
   * **Veículo (`veiculo.tsx`)**: Gestão e cadastro da van escolar e capacidade de passageiros.
   * **Finanças (`financas.tsx`)**: Controle de receitas, despesas e saldo líquido em tempo real.
2. **Autenticação (`app/index.tsx`)**:
   * Sistema de login integrado ao **Supabase Auth** (`signInWithPassword`) com opção de modo de demonstração.

---

## 📂 Estrutura do Projeto

```text
mobischool/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home Dinâmica
│   │   ├── rotas.tsx       # Painel e Trajeto de Alunos
│   │   ├── veiculo.tsx     # Gestão da Frota
│   │   └── financas.tsx    # Controle Financeiro
│   ├── rota/
│   │   └── index.tsx       # Detalhes de Rota
│   ├── index.tsx           # Tela de Login (Supabase Auth)
│   └── _layout.tsx
├── lib/
│   └── supabase.ts         # Configuração do Cliente Supabase
└── package.json
