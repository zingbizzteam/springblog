package com.zingbizz.blog.service;

import com.zingbizz.blog.model.BlogPost;
import com.zingbizz.blog.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class BlogPostService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    // Public methods
    public Page<BlogPost> getPublishedPosts(Pageable pageable) {
        return blogPostRepository.findByPublishedTrue(pageable);
    }

    public BlogPost getPublishedPostBySlug(String slug) {
        return blogPostRepository.findBySlugAndPublishedTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public Page<BlogPost> getPublishedPostsByTag(String tag, Pageable pageable) {
        return blogPostRepository.findByTagsContainingAndPublishedTrue(tag, pageable);
    }

    public Page<BlogPost> searchPublishedPosts(String searchTerm, Pageable pageable) {
        return blogPostRepository.searchPublishedPosts(searchTerm, pageable);
    }

    // Admin/Editor methods
    public Page<BlogPost> getAllPosts(Pageable pageable) {
        return blogPostRepository.findAll(pageable);
    }

    public Page<BlogPost> getPostsByAuthorId(String authorId, Pageable pageable) {
        return blogPostRepository.findByAuthorId(authorId, pageable);
    }

    public BlogPost getPostById(String id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public BlogPost createPost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    public BlogPost updatePost(String id, BlogPost post, String userId, boolean isAdmin) {
        BlogPost existingPost = getPostById(id);

        if (!isAdmin && !existingPost.getAuthorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own posts");
        }

        existingPost.setTitle(post.getTitle());
        existingPost.setExcerpt(post.getExcerpt());
        existingPost.setContent(post.getContent());
        existingPost.setTags(post.getTags());
        existingPost.setFeaturedImage(post.getFeaturedImage());
        existingPost.setUpdatedAt(LocalDateTime.now());

        return blogPostRepository.save(existingPost);
    }

    public void deletePost(String id, String userId, boolean isAdmin) {
        BlogPost post = getPostById(id);

        if (!isAdmin && !post.getAuthorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }

        blogPostRepository.delete(post);
    }

    public BlogPost publishPost(String id, String userId, boolean isAdmin) {
        BlogPost post = getPostById(id);

        if (!isAdmin && !post.getAuthorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only publish your own posts");
        }

        post.setPublished(true);
        post.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }
}
