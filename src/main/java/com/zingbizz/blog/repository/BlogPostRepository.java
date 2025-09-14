package com.zingbizz.blog.repository;

import com.zingbizz.blog.model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface BlogPostRepository extends MongoRepository<BlogPost, String> {

    // Public endpoints queries
    Page<BlogPost> findByPublishedTrue(Pageable pageable);

    Optional<BlogPost> findBySlugAndPublishedTrue(String slug);

    @Query("{'tags': ?0, 'published': true}")
    Page<BlogPost> findByTagsContainingAndPublishedTrue(String tag, Pageable pageable);

    // Admin/Editor queries
    Page<BlogPost> findByAuthorId(String authorId, Pageable pageable);

    @Query("{'published': false}")
    Page<BlogPost> findDraftPosts(Pageable pageable);

    @Query("{'authorId': ?0, 'published': false}")
    Page<BlogPost> findDraftPostsByAuthor(String authorId, Pageable pageable);

    // Search functionality
    @Query("{'$or': [{'title': {'$regex': ?0, '$options': 'i'}}, {'content': {'$regex': ?0, '$options': 'i'}}], 'published': true}")
    Page<BlogPost> searchPublishedPosts(String searchTerm, Pageable pageable);
}
