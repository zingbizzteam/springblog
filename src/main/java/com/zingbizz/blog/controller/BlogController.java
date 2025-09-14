package com.zingbizz.blog.controller;

import com.zingbizz.blog.model.BlogPost;
import com.zingbizz.blog.security.services.UserDetailsImpl;
import com.zingbizz.blog.service.BlogPostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class BlogController {

    @Autowired
    private BlogPostService blogPostService;

    // Public endpoints for frontend
    @GetMapping("/public")
    public ResponseEntity<Page<BlogPost>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogPost> posts = blogPostService.getPublishedPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/public/{slug}")
    public ResponseEntity<BlogPost> getPublishedPostBySlug(@PathVariable String slug) {
        BlogPost post = blogPostService.getPublishedPostBySlug(slug);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/public/tags/{tag}")
    public ResponseEntity<Page<BlogPost>> getPublishedPostsByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogPost> posts = blogPostService.getPublishedPostsByTag(tag, pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/public/search")
    public ResponseEntity<Page<BlogPost>> searchPublishedPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogPost> posts = blogPostService.searchPublishedPosts(q, pageable);
        return ResponseEntity.ok(posts);
    }

    // Protected endpoints for CMS
    @GetMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<BlogPost>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<BlogPost> posts;
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            posts = blogPostService.getAllPosts(pageable);
        } else {
            posts = blogPostService.getPostsByAuthorId(userDetails.getId(), pageable);
        }

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<BlogPost> getPostById(@PathVariable String id) {
        BlogPost post = blogPostService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    @PostMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<BlogPost> createPost(@Valid @RequestBody BlogPost post, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        post.setAuthor(userDetails.getUsername());
        post.setAuthorId(userDetails.getId());
        BlogPost savedPost = blogPostService.createPost(post);
        return ResponseEntity.ok(savedPost);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<BlogPost> updatePost(@PathVariable String id, @Valid @RequestBody BlogPost post, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        post.setUpdatedAt(LocalDateTime.now());
        BlogPost updatedPost = blogPostService.updatePost(id, post, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable String id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        blogPostService.deletePost(id, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN')")
    public ResponseEntity<BlogPost> publishPost(@PathVariable String id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BlogPost post = blogPostService.publishPost(id, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        return ResponseEntity.ok(post);
    }
}
