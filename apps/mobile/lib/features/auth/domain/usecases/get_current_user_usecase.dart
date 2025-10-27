import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class GetCurrentUserUseCase implements UseCase<User, GetCurrentUserParams> {
  final AuthRepository repository;
  
  GetCurrentUserUseCase(this.repository);
  
  @override
  Future<Either<Failure, User>> call(GetCurrentUserParams params) {
    return repository.getCurrentUser(token: params.token);
  }
}

class GetCurrentUserParams extends Equatable {
  final String token;
  
  const GetCurrentUserParams({required this.token});
  
  @override
  List<Object> get props => [token];
}

