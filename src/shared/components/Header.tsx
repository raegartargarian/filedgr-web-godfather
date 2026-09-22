// src/shared/components/Header.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeb3Auth } from "@/containers/global/Web3AuthProvider";
import { truncateAddress } from "@filedgr/web-core/format";
import {
  Crown,
  Facebook,
  Instagram,
  LogOut,
  Menu,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { useWalletAddress } from "../hooks/useWalletAddr";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, isAuthenticated, user, login, logout } =
    useWeb3Auth() || {};
  const walletAddress = useWalletAddress();

  const navigationItems = [{ name: "HOME", href: "#home", active: true }];

  const handleLogin = async () => {
    if (login) {
      try {
        await login();
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  const handleLogout = async () => {
    if (logout) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  return (
    <header className="godfather-header">
      <div className="godfather-header-container">
        {/* Logo Section */}
        <div className="godfather-logo">
          <Crown className="w-8 h-8 text-godfather-gold" />
          <div className="logo-text">
            <span className="logo-main">GAMBINO</span>
            <span className="logo-chapter">The Real Godfather</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="godfather-nav-desktop">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-item ${item.active ? "nav-item-active" : ""}`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* User Authentication & Actions */}
        <div className="godfather-header-actions">
          {/* Social Media Icons */}
          <div className="header-social-icons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Wallet/Auth Section */}
          <div className="auth-section">
            {isLoading ? (
              <div className="auth-loading">
                <div className="loading-spinner"></div>
                <span className="loading-text">Connecting...</span>
              </div>
            ) : isAuthenticated && (user || walletAddress) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="wallet-trigger">
                    <User className="w-4 h-4" />
                    <span className="wallet-address">
                      {truncateAddress(walletAddress || "Unknown")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="wallet-menu-content"
                  align="end"
                >
                  <DropdownMenuItem
                    className="wallet-menu-item-danger"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="connect-wallet-btn"
              >
                <Shield className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            className="mobile-menu-toggle md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="godfather-mobile-menu">
          <div className="mobile-menu-content">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`mobile-nav-item ${item.active ? "mobile-nav-item-active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}

            <div className="mobile-auth-section">
              {isAuthenticated && (user || walletAddress) ? (
                <div className="mobile-wallet-info">
                  <div className="mobile-user-info">
                    <User className="w-5 h-5 text-godfather-gold" />
                    <span>{truncateAddress(walletAddress || "Connected")}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="mobile-disconnect-btn"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="mobile-connect-btn"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
