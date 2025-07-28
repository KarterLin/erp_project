package com.example.erp.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.erp.dto.VoucherSearchRequest;
import com.example.erp.entity.Account;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class VoucherSpecification {

    public static Specification<JournalEntry> build(VoucherSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 加入 details join
            Join<JournalEntry, JournalDetail> detailJoin = root.join("details", JoinType.INNER);
            Join<JournalDetail, Account> accountJoin = detailJoin.join("account", JoinType.INNER);

            // 排除保留盈餘 (account.id != 65 )
            predicates.add(cb.notEqual(accountJoin.get("id"), 65L));

            // 排除反向分錄 (isSystemGenerated = false)
            predicates.add(cb.isFalse(detailJoin.get("isSystemGenerated")));

            // 傳票日期區間（主表欄位）
            if (request.getStartDate() != null && request.getEndDate() != null) {
                predicates.add(cb.between(root.get("entryDate"), request.getStartDate(), request.getEndDate()));
            }

            // 傳票編號（主表欄位）
            if (request.getVoucherNumber() != null && !request.getVoucherNumber().isBlank()) {
                predicates.add(cb.equal(root.get("voucherNumber"), request.getVoucherNumber()));
            }

            // 描述模糊查詢（明細欄位）
            if (request.getDescription() != null && !request.getDescription().isBlank()) {
                predicates.add(cb.like(detailJoin.get("description"), "%" + request.getDescription() + "%"));
            }

            // 科目名稱查詢（account.name）
            if (request.getAccount() != null && !request.getAccount().isBlank()) {
                predicates.add(cb.like(accountJoin.get("code"), request.getAccount()));
            }

            query.distinct(true); // 防止 join 重複
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

