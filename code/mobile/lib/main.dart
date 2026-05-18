import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/core/router/app_router.dart';
import 'package:biblioo/core/router/deep_link_handler.dart';
import 'package:biblioo/core/theme/app_theme.dart';
import 'package:biblioo/core/theme/theme_mode_cubit.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env", isOptional: true);
  await CooldownManager.instance.init();
  final injector = await Injector.init();
  runApp(BiblioApp(injector: injector));
}

class BiblioApp extends StatelessWidget {
  final Injector injector;
  const BiblioApp({super.key, required this.injector});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: injector.providers,
      child: BlocBuilder<ThemeModeCubit, ThemeMode>(
        builder: (context, themeMode) {
          return DeepLinkHandler(
            child: MaterialApp.router(
              title: 'Biblioo',
              theme: AppTheme.light,
              darkTheme: AppTheme.dark,
              themeMode: themeMode,
              routerConfig: appRouter,
            ),
          );
        },
      ),
    );
  }
}
