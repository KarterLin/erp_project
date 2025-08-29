package com.example.erp.entity;


import java.util.Set;

import com.example.erp.security.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="user_info")
public class UserInfo{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name="account")
	private String uAccount;
	@Column(name="password")
	private String uPassword;
	@Column(name="email")
	private String uEmail;
	@Column(name="role")
	@Enumerated(EnumType.STRING)
	private Role role;   // 職務權限設定
	@Column(name="status")
	private Integer status;
	@Column(name="company_id", nullable = true)
	private Long cId;
	
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getuAccount() {
		return uAccount;
	}
	public void setuAccount(String uAccount) {
		this.uAccount = uAccount;
	}
	public String getuPassword() {
		return uPassword;
	}
	public void setuPassword(String uPassword) {
		this.uPassword = uPassword;
	}
/*	
 * public String getuName() {
		return uName;
	}
	public void setuName(String uName) {
		this.uName = uName;
	}
*/
	public String getuEmail() {
		return uEmail;
	}
	public void setuEmail(String uEmail) {
		this.uEmail = uEmail;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public Long getcId() {
		return cId;
	}
	public void setcId(Long cId) {
		this.cId = cId;
	}
	
	//-------
	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
			name = "role_permission",
			joinColumns = @JoinColumn(name="role", referencedColumnName = "role", insertable = false, updatable = false),
			inverseJoinColumns = @JoinColumn(name = "permission_id")
			)
	private Set<Permission> permissions;
	
	
}
