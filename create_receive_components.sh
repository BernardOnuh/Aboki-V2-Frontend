#!/bin/bash

# Create directory if not exists
mkdir -p src/app/receive
# 1. Main Receive Menu (/receive)
cat << 'EOF' > src/app/receive/page.tsx
import ReceiveMenu from "@/components/receive/ReceiveMenu";
export default function Page() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-black flex justify-center">
      <ReceiveMenu />
    </div>
  );
}
EOF

# 2. Username Screen (/receive/username)
mkdir -p src/app/receive/username
cat << 'EOF' > src/app/receive/username/page.tsx
import ReceiveUsername from "@/components/receive/ReceiveUsername";
export default function Page() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-black flex justify-center">
      <ReceiveUsername />
    </div>
  );
}
EOF

# 3. Request Link Screen (/receive/request)
mkdir -p src/app/receive/request
cat << 'EOF' > src/app/receive/request/page.tsx
import RequestLink from "@/components/receive/RequestLink";
export default function Page() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-black flex justify-center">
      <RequestLink />
    </div>
  );
}
EOF

# 4. Address Screen (/receive/address)
mkdir -p src/app/receive/address
cat << 'EOF' > src/app/receive/address/page.tsx
import ReceiveAddress from "@/components/receive/ReceiveAddress";
export default function Page() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-black flex justify-center">
      <ReceiveAddress />
    </div>
  );
}
EOF


echo "All receive components created successfully!"
