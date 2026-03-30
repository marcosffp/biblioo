import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/core/router/app_router.dart';
import 'package:biblioo/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
      child: MaterialApp.router(
        title: 'Biblioo',
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        routerConfig: appRouter,
      ),
    );
  }
}