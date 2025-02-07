<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Exception;

class MovieController extends Controller
{
    public function getMovie($keyword, $page)
    {
        $client = new \GuzzleHttp\Client();
        $search = str_replace(' ', '+', $keyword);
        $query = strlen(str_replace(' ', '', $keyword)) > 0 ? '&query=' . $search : '';
        $sortWay = $sortType ?? 'asc';

        $route = strlen($query) < 1 ? 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=' . $page : 'https://api.themoviedb.org/3/search/movie?page=' . $page. $query;

        $authKey = env("MOVIE_AUTH_TOKEN", " ");

        $response = $client->request('GET', $route, [
            'headers' => [
                'Authorization' => 'Bearer ' . $authKey,
                'accept' => 'application/json',
            ],
        ]);
        $data = $response->getBody();
        return $data;
    }

    public function getMovieById($id)
    {
        try {
            $client = new \GuzzleHttp\Client();
            $authKey = env("MOVIE_AUTH_TOKEN", " ");
            $route = 'https://api.themoviedb.org/3/movie/' . $id . '?language=en-US';

            $response = $client->request('GET', $route, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $authKey,
                    'accept' => 'application/json',
                ],
            ]);
            $data = $response->getBody();
            return $data;
        } catch (Exception $error) {
            echo $error->getMessage();
            return response()->json(['status' => 500, 'success' => false, 'error' => $error]);
        }
    }
}
