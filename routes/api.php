<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\MovieController;

Route::get('movie/{keyword}/{page}', [MovieController::class, 'getMovie']);
Route::get('movieById/{id}', [MovieController::class, 'getMovieById']);