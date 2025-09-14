package com.zingbizz.blog.repository;

import com.zingbizz.blog.model.ERole;
import com.zingbizz.blog.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
}
