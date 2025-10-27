import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/errors/exceptions.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:mobile/features/auth/data/datasources/auth_local_datasource.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, LoginResponse>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await remoteDataSource.login(
        email: email,
        password: password,
      );
      
      // After proto generation, uncomment:
      // final user = UserModel.fromProto(response.user);
      // 
      // await localDataSource.saveTokens(
      //   accessToken: response.accessToken,
      //   refreshToken: response.refreshToken,
      //   sessionToken: response.sessionToken,
      // );
      // 
      // await localDataSource.saveUser(user);
      // 
      // return Right(LoginResponse(
      //   user: user,
      //   accessToken: response.accessToken,
      //   refreshToken: response.refreshToken,
      //   sessionToken: response.sessionToken,
      // ));
      
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, LoginResponse>> googleLogin({
    required String idToken,
  }) async {
    try {
      final response = await remoteDataSource.googleLogin(idToken: idToken);
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await remoteDataSource.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      final token = await localDataSource.getAccessToken();
      
      if (token != null) {
        await remoteDataSource.logout(token: token);
      }
      
      await localDataSource.clearAuthData();
      
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, TokenResponse>> refreshToken({
    required String refreshToken,
  }) async {
    try {
      final response = await remoteDataSource.refreshToken(
        refreshToken: refreshToken,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser({
    required String token,
  }) async {
    try {
      // Try cache first
      final cachedUser = await localDataSource.getCachedUser();
      if (cachedUser != null) {
        return Right(cachedUser);
      }
      
      final response = await remoteDataSource.getCurrentUser(token: token);
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateProfile({
    required String userId,
    required Map<String, dynamic> updates,
  }) async {
    // Will implement after proto generation
    return const Left(ServerFailure('Proto files not generated'));
  }

  @override
  Future<Either<Failure, void>> sendVerificationEmail({
    required String userId,
  }) async {
    // Will implement after proto generation
    return const Left(ServerFailure('Proto files not generated'));
  }

  @override
  Future<Either<Failure, void>> verifyEmail({
    required String token,
  }) async {
    // Will implement after proto generation
    return const Left(ServerFailure('Proto files not generated'));
  }

  @override
  Future<Either<Failure, void>> forgotPassword({
    required String email,
  }) async {
    // Will implement after proto generation
    return const Left(ServerFailure('Proto files not generated'));
  }

  @override
  Future<Either<Failure, void>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    // Will implement after proto generation
    return const Left(ServerFailure('Proto files not generated'));
  }
}

