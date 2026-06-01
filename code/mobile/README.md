<!--
<div align="center" style="background:#1a1a2e;padding:32px 0;border-radius:12px">
<div align="center" style="background:#3fc3a7;padding:32px 80px;border-radius:12px;width:85%">
-->
<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../docs/imagens/banner.png" />

# Mobile

> App Flutter offline-first do Biblioo. Foco em UX fluida, acesso offline e sincronizacao segura com a API.

---

## 🛠️ Stack Principal

![Flutter](https://img.shields.io/badge/Flutter-3.11%2B-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-3.11-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Bloc](https://img.shields.io/badge/Bloc-8.1.6-5A4FCF?style=for-the-badge)
![Drift](https://img.shields.io/badge/Drift-2.18.0-1E88E5?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![SharedPreferences](https://img.shields.io/badge/SharedPreferences-2.3.0-546E7A?style=for-the-badge)
![Hive](https://img.shields.io/badge/Hive-1.1.0-F9A825?style=for-the-badge)
![Dio](https://img.shields.io/badge/Dio-5.7.0-3F51B5?style=for-the-badge)
![WebSocket](https://img.shields.io/badge/WebSocket-3.0.0-2E7D32?style=for-the-badge)
![get_it](https://img.shields.io/badge/get_it-8.0.0-607D8B?style=for-the-badge)
![injectable](https://img.shields.io/badge/injectable-2.4.0-607D8B?style=for-the-badge)
![go_router](https://img.shields.io/badge/go_router-14.0.0-1976D2?style=for-the-badge)
![Freezed](https://img.shields.io/badge/Freezed-2.5.0-00ACC1?style=for-the-badge)
![json_serializable](https://img.shields.io/badge/json_serializable-6.8.0-4E342E?style=for-the-badge)
![Google_Sign--In](https://img.shields.io/badge/Google_Sign--In-6.2.1-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 📑 Sumario

- [Sobre o app](#-sobre-o-app)
- [Arquitetura](#-arquitetura)
- [Justificativas das escolhas](#-justificativas-das-escolhas)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Regras de arquitetura](#-regras-de-arquitetura)
- [Fluxo de dados](#-fluxo-de-dados)
- [Variaveis de ambiente](#-variaveis-de-ambiente)
- [Instalacao e execucao](#-instalacao-e-execucao)
- [Build e distribuicao](#-build-e-distribuicao)
- [Tecnologias e dependencias](#-tecnologias-e-dependencias)

---

## 📖 Sobre o app

O app mobile do **Biblioo** e o ponto principal de uso do produto. Ele funciona **offline-first** e sincroniza com a API quando a conexao retorna. A arquitetura separa **dominio** (features) de **UI** (screens) para manter o codigo escalavel, previsivel e facil de evoluir por times diferentes.

---

## 🏛️ Arquitetura

O projeto segue **Feature-first com datasources + Screen layer**, com conceitos pontuais de DDD (Value Objects e Aggregate Roots). Nao é Clean Architecture completa: sem usecases formais e sem interfaces de repository.

```
lib/
├── main.dart
├── bootstrap.dart
├── core/
│   ├── database/         # Drift · SQLite
│   ├── network/          # Dio · WebSocket
│   ├── sync/             # SyncManager · SyncQueue
│   ├── connectivity/
│   ├── router/           # go_router
│   ├── theme/
│   └── di/               # get_it · injectable
├── features/             # dominio — dados, logica, estado
│   ├── auth/
│   ├── shelf/
│   ├── book/
│   ├── community/
│   ├── dna/
│   └── recommendation/
├── screens/              # telas — composicao de features
│   ├── feed/
│   ├── recommendation/
│   ├── shelf/
│   ├── community/
│   └── profile/
└── shared/
    ├── widgets/
    ├── utils/
    └── constants/
```

---

## ✅ Justificativas das escolhas

| Escolha | Motivo |
|---|---|
| Feature-first + Screen layer | Evita acoplamento entre dominios e UI, permite composicao de multiplas features numa tela. |
| Datasources (local/remote) + Repository | Garante **offline-first** e fallback automatico quando sem internet. |
| Bloc / Cubit | Estado previsivel, facil de testar e padrao consistente no time. |
| Drift (SQLite tipado) | Persistencia local robusta e migrations seguras. |
| Dio + interceptors | Padroniza auth, retry e tratamento de erros. |
| get_it + injectable | DI simples e centralizada, melhora modularidade. |
| go_router | Navegacao declarativa e suporte a deep links. |

---

## 📁 Estrutura de pastas

### Estrutura de uma feature

```
features/{feature}/
├── data/
│   ├── {feature}_local_datasource.dart
│   ├── {feature}_remote_datasource.dart
│   ├── {feature}_repository.dart
│   └── models/
│       └── {feature}_model.dart
├── domain/
│   ├── {feature}.dart              # entity / aggregate root
│   └── value_objects/
│       └── {value_object}.dart
└── bloc/
    ├── {feature}_bloc.dart
    ├── {feature}_event.dart
    └── {feature}_state.dart
```

### Estrutura de uma screen

```
screens/{screen}/
├── {screen}_screen.dart
└── widgets/
    └── {widget_name}.dart
```

---

## 🔒 Regras de arquitetura

- `features/` nunca importa outras features.
- `features/` nunca importa `screens/`.
- `screens/` pode importar multiplas features.
- `shared/` nao importa `features/` nem `screens/`.
- `domain/` nao depende de Flutter, Dio, Drift ou DI.
- Bloc chama **apenas** Repository, nunca datasource direto.
- Repository sempre tenta **local primeiro** e sincroniza remoto quando possivel.

---

## 🔁 Fluxo de dados

```
Screen
  └── monta Bloc(s)
        └── Widget dispara Event
              └── Bloc chama Repository
                    ├── LocalDatasource (Drift/Prefs)  ← primeiro
                    └── RemoteDatasource (Dio)         ← quando online
              └── Bloc emite State
        └── Widget reage via BlocBuilder
```

---

## 🔑 Variaveis de ambiente

Crie um `.env` em `code/mobile/` com base no `.env.example`.

```dotenv
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
API_URL=http://localhost:8080
```

- `GOOGLE_WEB_CLIENT_ID`: client ID Web usado no login com Google.
- `API_URL`: base URL da API usada pelo app.

---

## 🚀 Instalacao e execucao

### Pre-requisitos

- Flutter SDK (>= 3.11)
- Android SDK (para Android)
- Xcode (para iOS)

### Passo a passo

```bash
cd code/mobile
flutter pub get
cp .env.example .env
flutter run
```

---

## 📦 Build e distribuicao

```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS (macOS + Xcode)
flutter build ipa --release
```

Saidas principais:

- `build/app/outputs/flutter-apk/app-release.apk`
- `build/app/outputs/bundle/release/app-release.aab`
- `build/ios/ipa/*.ipa`

---

## 📦 Tecnologias e dependencias

| Categoria | Tecnologia | Versao |
|---|---|---|
| Framework | Flutter | 3.11+ |
| Estado | flutter_bloc | ^8.1.6 |
| Rede | dio | ^5.7.0 |
| WebSocket | web_socket_channel | ^3.0.0 |
| Local DB | drift | ^2.18.0 |
| Cache | shared_preferences | ^2.3.0 |
| Cache leve | hive_flutter | ^1.1.0 |
| Roteamento | go_router | ^14.0.0 |
| DI | get_it / injectable | ^8.0.0 / ^2.4.0 |
| Modelos | freezed / json_serializable | ^2.5.0 / ^6.8.0 |
| Auth | google_sign_in | ^6.2.1 |
