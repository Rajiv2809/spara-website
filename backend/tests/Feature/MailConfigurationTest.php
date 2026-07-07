<?php

namespace Tests\Feature;

use Tests\TestCase;

class MailConfigurationTest extends TestCase
{
    public function test_smtp_mailer_is_configured_for_gmail(): void
    {
        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('smtp', config('mail.mailers.smtp.transport'));
        $this->assertSame('smtp.gmail.com', config('mail.mailers.smtp.host'));
        $this->assertSame('587', config('mail.mailers.smtp.port'));
        $this->assertSame('sbumtrpl209@gmail.com', config('mail.from.address'));
    }
}
