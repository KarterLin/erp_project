package com.example.erp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.erp.entity.Account;

public interface BalanceSheetRepository extends JpaRepository<Account, Long> {

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "WHERE a.type = com.example.erp.entity.AccountType.asset")
    List<Account> findUsedAssetAccounts();
}