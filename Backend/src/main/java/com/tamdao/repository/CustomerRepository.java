package com.tamdao.repository;

import com.tamdao.modal.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName, String email);

    List<Customer> findByStoreId(Long storeId);

    List<Customer> findByBranchId(Long branchId);

    @Query(value = "SELECT * FROM customer WHERE deleted = true AND store_id = :storeId", nativeQuery = true)
    List<Customer> findDeletedByStoreId(@Param("storeId") Long storeId);

    @Query(value = "SELECT * FROM customer WHERE deleted = true AND branch_id = :branchId", nativeQuery = true)
    List<Customer> findDeletedByBranchId(@Param("branchId") Long branchId);

//    analysis
@Query("""
        SELECT COUNT(DISTINCT o.customer.id)
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
    """)
int countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);

    // Soft delete: trash & restore (native queries bypass @SQLRestriction)
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE customer SET deleted = false, deleted_at = NULL, deleted_by = NULL WHERE id = :id AND deleted = true", nativeQuery = true)
    int restoreById(@Param("id") Long id);
}
