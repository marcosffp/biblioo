# Front-end Biblioo

Base inicial do front-end web do Biblioo com Next.js + TypeScript.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

## Estrutura em camadas

```text
src/
	app/                 # rotas e layouts
	presentation/        # componentes de interface
		components/
			primitives/
			composites/
			patterns/
		layouts/
		icons/
	application/         # use-cases, view-models e mapeadores
		use-cases/
		view-models/
		mappers/
	infrastructure/      # cliente de API e servicos
		api/
		services/
		adapters/
	shared/              # recursos reutilizaveis globais
		design-tokens/
		types/
		constants/
		utils/
```

## Proximo passo

Implementar design tokens dedicados e os primeiros componentes primitives (Button, Input, Avatar, Chip, Tabs e ProgressBar).
