import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';

class SocialLoginButtons extends StatelessWidget {
  const SocialLoginButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Google Login Button
        OutlinedButton.icon(
          onPressed: () {
            // Will implement Google Sign In
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đăng nhập Google sẽ sớm có'),
              ),
            );
          },
          icon: Image.asset(
            'assets/images/google_logo.png',
            height: 24,
            errorBuilder: (context, error, stackTrace) {
              return const Icon(Icons.g_mobiledata, size: 24);
            },
          ),
          label: const Text('Đăng nhập với Google'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
      ],
    );
  }

  void _handleGoogleLogin(BuildContext context) async {
    // Will implement with google_sign_in package
    // final GoogleSignIn googleSignIn = GoogleSignIn();
    // try {
    //   final account = await googleSignIn.signIn();
    //   if (account != null) {
    //     final auth = await account.authentication;
    //     context.read<AuthBloc>().add(
    //       AuthGoogleLoginRequested(auth.idToken!),
    //     );
    //   }
    // } catch (e) {
    //   ScaffoldMessenger.of(context).showSnackBar(
    //     SnackBar(content: Text('Google login failed: $e')),
    //   );
    // }
  }
}

