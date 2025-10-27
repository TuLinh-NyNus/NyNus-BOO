import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class GoogleLoginUseCase implements UseCase<LoginResponse, GoogleLoginParams> {
  final AuthRepository repository;
  
  GoogleLoginUseCase(this.repository);
  
  @override
  Future<Either<Failure, LoginResponse>> call(GoogleLoginParams params) {
    return repository.googleLogin(idToken: params.idToken);
  }
}

class GoogleLoginParams extends Equatable {
  final String idToken;
  
  const GoogleLoginParams({required this.idToken});
  
  @override
  List<Object> get props => [idToken];
}

