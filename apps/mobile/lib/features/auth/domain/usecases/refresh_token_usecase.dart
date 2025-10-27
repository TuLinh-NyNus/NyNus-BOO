import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class RefreshTokenUseCase implements UseCase<TokenResponse, RefreshTokenParams> {
  final AuthRepository repository;
  
  RefreshTokenUseCase(this.repository);
  
  @override
  Future<Either<Failure, TokenResponse>> call(RefreshTokenParams params) {
    return repository.refreshToken(refreshToken: params.refreshToken);
  }
}

class RefreshTokenParams extends Equatable {
  final String refreshToken;
  
  const RefreshTokenParams({required this.refreshToken});
  
  @override
  List<Object> get props => [refreshToken];
}

