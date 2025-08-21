package com.example.erp.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="company_info")
public class CompanyInfo {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		private Long id;
		@Column(name="company_name")
		private String cName;
		@Column(name="taxID")
		private String taxId;
		@Column(name="responsible_person")
		private String rName;
		@Column(name="res_phone")
		private String rTel;
		@Column(name="res_email")
		private String rEmail;
		
		public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}
		public String getcName() {
			return cName;
		}
		public void setcName(String cName) {
			this.cName = cName;
		}
		public String getTaxId() {
			return taxId;
		}
		public void setTaxId(String taxId) {
			this.taxId = taxId;
		}
		public String getrName() {
			return rName;
		}
		public void setrName(String rName) {
			this.rName = rName;
		}
		public String getrTel() {
			return rTel;
		}
		public void setrTel(String rTel) {
			this.rTel = rTel;
		}
		public String getrEmail() {
			return rEmail;
		}
		public void setrEmail(String rEmail) {
			this.rEmail = rEmail;
		}
		
		
		// 一對多
		@OneToMany(mappedBy = "cId")
		private List<UserInfo> users;

		
		public List<UserInfo> getUsers() {
			return users;
		}
		public void setUsers(List<UserInfo> users) {
			this.users = users;
		}
		
		
}
