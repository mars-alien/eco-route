import random
from typing import List, Tuple
from .geo import haversine_km


class Point:
    def __init__(self, order_id: str, lat: float, lng: float):
        self.order_id = order_id
        self.lat = lat
        self.lng = lng


class Cluster:
    def __init__(self, centroid_lat: float, centroid_lng: float):
        self.centroid_lat = centroid_lat
        self.centroid_lng = centroid_lng
        self.points: List[Point] = []


class KMeansClusterer:
    """
    K-Means++ clustering on geographic coordinates.
    K-Means++ initialization: choose first centroid uniformly at random, then
    each subsequent centroid with probability proportional to D(x)^2 where D(x)
    is the distance from x to the nearest already-chosen centroid. This spreads
    initial centroids and avoids poor convergence of naive random initialization.
    Convergence: stop when max centroid shift across all clusters < tolerance (km)
    or max_iter reached.
    """

    def __init__(self, k: int, max_iter: int = 100, tolerance: float = 0.0001):
        self.k = k
        self.max_iter = max_iter
        self.tolerance = tolerance

    def _init_centroids_plus_plus(self, points: List[Point]) -> List[Tuple[float, float]]:
        centroids = []
        first = random.choice(points)
        centroids.append((first.lat, first.lng))

        for _ in range(self.k - 1):
            distances = []
            for p in points:
                min_dist = min(
                    haversine_km(p.lat, p.lng, c[0], c[1]) for c in centroids
                )
                distances.append(min_dist ** 2)
            total = sum(distances)
            probs = [d / total for d in distances]
            r = random.random()
            cumulative = 0.0
            chosen = points[-1]
            for i, p in enumerate(points):
                cumulative += probs[i]
                if r <= cumulative:
                    chosen = p
                    break
            centroids.append((chosen.lat, chosen.lng))

        return centroids

    def fit(self, points: List[Point]) -> List[Cluster]:
        if len(points) <= self.k:
            clusters = []
            for p in points:
                c = Cluster(p.lat, p.lng)
                c.points = [p]
                clusters.append(c)
            return clusters

        centroids = self._init_centroids_plus_plus(points)

        for _ in range(self.max_iter):
            clusters = [Cluster(c[0], c[1]) for c in centroids]
            for p in points:
                nearest_idx = min(
                    range(self.k),
                    key=lambda i: haversine_km(p.lat, p.lng, centroids[i][0], centroids[i][1])
                )
                clusters[nearest_idx].points.append(p)

            new_centroids = []
            for cluster in clusters:
                if not cluster.points:
                    rp = random.choice(points)
                    new_centroids.append((rp.lat, rp.lng))
                else:
                    mean_lat = sum(p.lat for p in cluster.points) / len(cluster.points)
                    mean_lng = sum(p.lng for p in cluster.points) / len(cluster.points)
                    new_centroids.append((mean_lat, mean_lng))

            max_shift = max(
                haversine_km(centroids[i][0], centroids[i][1],
                             new_centroids[i][0], new_centroids[i][1])
                for i in range(self.k)
            )
            centroids = new_centroids
            if max_shift < self.tolerance:
                break

        final_clusters = [Cluster(c[0], c[1]) for c in centroids]
        for p in points:
            nearest_idx = min(
                range(self.k),
                key=lambda i: haversine_km(p.lat, p.lng, centroids[i][0], centroids[i][1])
            )
            final_clusters[nearest_idx].points.append(p)

        return [c for c in final_clusters if c.points]
