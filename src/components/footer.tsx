import Link from "next/link"
import { Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PANORA</h3>
            <p className="text-sm text-muted-foreground">
              Pakistan's premier real estate platform offering innovative virtual tours and comprehensive property solutions. Your trusted partner in finding the perfect property or listing your investment.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/buy" className="text-sm text-muted-foreground hover:text-primary">
                  Buy
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-sm text-muted-foreground hover:text-primary">
                  Rent
                </Link>
              </li>
              <li>
                <Link href="/list-property" className="text-sm text-muted-foreground hover:text-primary">
                  Sell
                </Link>
              </li>
              <li>
                <Link href="/virtual-tours" className="text-sm text-muted-foreground hover:text-primary">
                  Virtual Tours
                </Link>
              </li>
              <li>
                <Link href="/our-services" className="text-sm text-muted-foreground hover:text-primary">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/properties-sold" className="text-sm text-muted-foreground hover:text-primary">
                  Properties Sold
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <Link 
                href="https://www.instagram.com/panoraproperties" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.linkedin.com/company/panoraproperties/?lipi=urn%3Ali%3Apage%3Ad_flagship3_search_srp_all%3Bs5%2B2tghBQzuR1ULh8bP8dQ%3D%3D" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:contact@panoraproperties.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PANORA Properties. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 